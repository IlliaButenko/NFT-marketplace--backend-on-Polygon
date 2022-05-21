import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { ID } from '../global/interfaces/id.interface';
import { CreateNFTDto } from './dtos/createNFT.dto';
import { QueryNFTDto } from './dtos/queryNFT.dto';
import { NFT } from './schemas/nft.schema';
import { IpfsService } from 'src/helper/ipfs.service';
import { OwnershipService } from './ownership.service';
import { NftTypeEnum } from './interfaces/nftType.enum';
import { SaleService } from './sale.service';
import { ConfigService } from '@nestjs/config';
import { Contract, ethers } from 'ethers';
import { UserService } from 'src/user/user.service';
import { EventService } from '../event/event.service';
import { Sale } from './schemas/sale.schema';
import { CollectionService } from 'src/collection/collection.service';
import { ContractService } from './contracts/contract.service';
import { CreateLazyNFTDto } from "./dtos/createLazyNFT.dto";

const zeroAddress = '0x0000000000000000000000000000000000000000';

@Injectable()
export class NftService {
  private readonly logger = new Logger('NFT service');

  constructor(
    @InjectModel(NFT)
    private readonly model: ReturnModelType<typeof NFT>,
    private readonly ownerShipService: OwnershipService,
    private readonly userService: UserService,
    private readonly saleService: SaleService,
    private readonly ipfsService: IpfsService,
    private readonly configService: ConfigService,
    private readonly eventService: EventService,
    private readonly collectionService: CollectionService,
    private readonly contractServcie: ContractService,
  ) {}

  async findAll(query: QueryNFTDto): Promise<PaginateResponse<NFT>> {
    const findQuery = this.model.find();
    if (query.search) {
      findQuery.or([
        { name: { $regex: '.*' + query.search + '.*', $options: 'i' } },
      ]);
    }
    if ('activated' in query) {
      findQuery.where({ activated: query.activated });
    }

    if("fileType" in query){
      findQuery.where({ fileType: query.fileType });
    }

    if ('creator' in query) {
      findQuery.where({ creator: query.creator });
    }

    const count = await this.model.find().merge(findQuery).countDocuments();
    findQuery
      .sort({ [query.sortBy]: query.sortType })
      .skip(query.page * query.size)
      .limit(query.size);

    return {
      items: await findQuery.populate('creator').exec(),
      paginate: {
        page: query.page,
        size: query.size,
        count,
      },
    };
  }

  async findOne(id: ID): Promise<{ nft: NFT; sales: Sale[] }> {
    const nft = await this.model.findById(id).populate('creator').exec();
    const sales = await this.saleService.getInSaleNft(nft.id);
    return {
      nft,
      sales,
    };
  }

  async findByToken(
    tokenAddress: string,
    tokenId: number,
    chainId = 0,
  ): Promise<NFT> {
    return await this.model
      .findOne({
        tokenAddress: { $in: [tokenAddress, tokenAddress.toLowerCase()] },
        tokenId,
        chainId,
      })
      .exec();
  }

  async findByUser(userId: any, type: NftTypeEnum) {
    switch (type) {
      case NftTypeEnum.OWNED:
        return this.ownerShipService.getOwnedByUser(userId);
      case NftTypeEnum.CREATED:
        return this.model.find({ creator: userId });
      case NftTypeEnum.INSALE:
        return this.saleService.getInSaleByUser(userId);
      default:
        return [];
    }
  }

  async findOrCreate(
    id: number,
    tokenAddress: string,
    chainId: number,
    payload,
  ) {
    const contract = this.contractServcie.getCollectionContract(
      chainId,
      tokenAddress,
    );
    const nft = await this.model.findOne({
      tokenId: id,
      tokenAddress: tokenAddress,
      chainId: chainId,
    });
    if (nft) {
      return nft;
    }

    const uri = await contract.uri(id);

    const metadata = await this.ipfsService.fetchUri(uri);
    const collection = await this.collectionService.findOrCreateByAddress(
      contract.address,
      chainId,
    );
    return this.model.create({
      tokenId: id,
      tokenAddress: tokenAddress,
      chainId: chainId,
      royalty: 250,
      ...metadata,
      uri: uri,
      ...payload,
      collectionId: collection?._id,
    });
  }

  async onTransferSingle(
    eventArgs: ethers.utils.Result,
    chainId: number,
    contract: Contract,
    isLazy = false,
    signature = '',
  ) {
    const [operator, from, to, id, value] = eventArgs;
    this.logger.verbose('Is lazy: ' + isLazy);
    this.logger.verbose(`Transfer ${id} from ${from} to ${to}, ${value}`);

    const receiver = await this.userService.findOrCreateByAddress(to);

    if (+from != 0) {
      const sender = await this.userService.findOrCreateByAddress(from);

      const nft = await this.model.findOne({
        tokenId: id,
        tokenAddress: contract.address.toLowerCase(),
        chainId: chainId,
      });
      await this.ownerShipService.transfer(
        sender._id.toString(),
        receiver._id.toString(),
        nft._id,
        +value,
      );
      return;
    }
    const payload = { supply: +value, creator: receiver._id };

    let nft;
    if (isLazy) {
      nft = await this.mintLazy(
        +id,
        contract.address.toLowerCase(),
        chainId,
        signature,
      );
    } else {
      nft = await this.findOrCreate(
        +id,
        contract.address.toLowerCase(),
        chainId,
        payload,
      );
    }

    if (!isLazy) {
      await this.ownerShipService.transfer(
        from,
        receiver._id.toString(),
        nft._id,
        +value,
      );
    }
    this.logger.log('Saved NFT', id);
  }

  async mintLazy(
    tokenId: number,
    tokenAddress: string,
    chainId: number,
    signature: string,
  ) {
    const lazyNft = await this.model.findOne({
      tokenAddress: tokenAddress,
      chainId: chainId,
      isLazy: true,
      signature: signature,
    });
    if (!lazyNft) {
      throw new Error('Lazy NFT not found');
    }
    lazyNft.isLazy = false;
    lazyNft.tokenId = tokenId;
    return await lazyNft.save();
  }

  async createLazyNFT(
    tokenAddress: string,
    chainId: number,
    signature: string,
    params: CreateLazyNFTDto,
  ) {
    let nft = await this.model.findOne({
      tokenAddress: tokenAddress,
      chainId: chainId,
      signature: signature,
    });
    if (nft) {
      throw new Error('Lazy NFT already exists');
    }

    const metadata = await this.ipfsService.fetchUri(params.uri);
    const collection = await this.collectionService.findOrCreateByAddress(
      tokenAddress,
      chainId,
    );
    const creator = await this.userService.findOrCreateByAddress(
      params.creatorAddress,
    );

    nft = await this.model.create({
      tokenAddress: tokenAddress,
      chainId: chainId,
      isLazy: true,
      signature: signature,
      ...metadata,
      uri: params.uri,
      supply: params.supply,
      creator: creator._id,
      collectionId: collection?._id,
    });

    await this.ownerShipService.transfer(
      '0x0',
      creator._id.toString(),
      nft._id,
      +params.supply,
    );
    return nft;
  }

  async importNft(
    ownerAddress: string,
    address: string,
    id: number,
    chainId: number,
  ) {
    const nft = await this.model.findOne({
      tokenId: +id,
      tokenAddress: address.toLowerCase(),
      chainId: chainId,
    });
    if (nft) {
      return nft;
    }
    console.log(id, address, chainId);
    const contract = this.contractServcie.getCollectionContract(
      chainId,
      address,
    );
    const balance = await contract.balanceOf(ownerAddress, id);
    const uri = await contract.uri(id);
    const metadata = await this.ipfsService.fetchUri(uri);
    // const creatorAddress = await contract.getCreator(id);

    if (balance <= 0) {
      throw new Error(`NFT ${id} is not owned by ${ownerAddress}`);
    }

    let collection = await this.collectionService.findByAddress(
      address,
      chainId,
    );
    if (!collection) {
      collection = await this.collectionService.createByAddress(
        address,
        chainId,
      );
    }

    const owner = await this.userService.findOrCreateByAddress(ownerAddress);

    const newNft = await this.model.create({
      tokenId: id,
      tokenAddress: contract.address.toLowerCase(),
      chainId,
      supply: +balance,
      royalty: 250,
      ...metadata,
      uri: uri,
      creator: owner?._id,
      collectionId: collection?._id,
    });

    await this.ownerShipService.transfer(
      '0x0',
      owner._id.toString(),
      newNft._id,
      +balance,
    );
    return newNft;
  }

  async refreshUri(id: ID) {
    const nft = await this.model.findById(id).exec();
    if (!nft) {
      throw new HttpException('NFT not found', HttpStatus.NOT_FOUND);
    }

    const metadata = await this.ipfsService.fetchUri(nft.uri);
    return this.model.findByIdAndUpdate(id, { ...metadata });
  }

  async findByCollection(id: ID): Promise<NFT[]> {
    const nft = await this.model.find({ collecitonId: id }).exec();
    return nft;
  }

  async deleteNft(id: ID) {
    await this.model.findByIdAndDelete(id);
  }
}

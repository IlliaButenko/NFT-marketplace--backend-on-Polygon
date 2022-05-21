import { QueryNFTSale } from './dtos/queryNFTSale.dto';
/* eslint-disable no-var */
/* eslint-disable prettier/prettier */
import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Sale } from './schemas/sale.schema';
import { ID } from 'src/global/interfaces/id.interface';
import { OwnershipService } from './ownership.service';
import { SaleNFTDto } from './dtos/saleNFT.dto';
import { ethers } from 'ethers';
import { abi as MarketAbi } from './contracts/Marketplace.json';
import { ConfigService } from '@nestjs/config';
import { NftService } from './nft.service';
import { UserService } from '../user/user.service';
import { EventService } from '../event/event.service';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { Interval } from '@nestjs/schedule';
import { SaleType } from './interfaces/saleType.enum';
import { CollectionService } from 'src/collection/collection.service';
import { CreateLazyNFTDto } from './dtos/createLazyNFT.dto';
import { NFT } from './schemas/nft.schema';
import { UpdateNFTSaleDto } from './dtos/updateNFTSale.dto';

@Injectable()
export class SaleService {
  private contractMatic: ethers.Contract;
  private readonly logger = new Logger('Sale service');

  constructor(
    @InjectModel(Sale)
    private readonly model: ReturnModelType<typeof Sale>,
    private readonly ownershipService: OwnershipService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
    @Inject(forwardRef(() => NftService))
    private nftService: NftService,
    private readonly collectionService: CollectionService,
  ) { }

  async findAll(page, limit, query): Promise<PaginateResponse<Sale>> {
    const findQuery = this.model.find({ quantity: { $gt: 0 }, isDenied: { $ne: true } });

    if (query.saleType) {
      const currentDate = new Date().getTime() / 1000;
      findQuery.find({
        saleType: SaleType.AUCTION,
        endTime: { $gt: currentDate },
      });
    }

    const count = await this.model.find().merge(findQuery).countDocuments();
    findQuery
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    var result = await findQuery.populate("nft").populate('seller').exec();

    return {
      items: result,
      paginate: {
        page: page,
        size: limit,
        count,
      },
    };
  }

  async findAllAdmin(page, limit, query: QueryNFTSale): Promise<PaginateResponse<Sale>> {
    if (!query.search) {
      query.search = "";
    }
    var columnFilter = "saleType"
    if (!query.saleType) {
      query.saleType = "-1";
      columnFilter = "tamp";
    }
    const findQuery = this.model.aggregate([
      {
        $match: {
          quantity: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft'
        }
      },
      {
        $unwind: "$nft"
      },
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'seller'
        }
      },
      {
        $unwind: "$seller"
      },
      {
        $lookup: {
          from: 'users',
          localField: 'nft.creator',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: "$creator"
      },
      {
        $project: {
          _id: "$_id",
          id: "$nft._id",
          name: "$nft.name",
          username: "$seller.username",
          supply: "$nft.supply",
          image: "$nft.image",
          unitPrice: "$unitPrice",
          tokenId: "$nft.tokenId",
          collectionId: "$nft.collectionId",
          creator: "$creator.username",
          quantity: "$quantity",
          endTime: "$endTime",
          saleType: "$saleType",
          seller: "$seller.username",
          fileType: "$nft.fileType",
          typeOrigin: "$nft.originType",
          activated: "$nft.activated",
          feature: "$feature",
          isDenied: "$isDenied",
          tamp: "-1"
        }
      },
      {
        $addFields: {
          tamp: { $toInt: "$tamp" }
        }
      },
      {
        $match: {
          name: { $regex: '.*' + query.search + '.*', $options: 'i' },
        }
      },
      {
        $match: {
          [columnFilter]: parseInt(query.saleType)
        }
      }
    ]);
    const result = await findQuery.exec();
    return {
      items: result,
      paginate: {
        page: page,
        size: limit,
        count: 10,
      },
    };
  }

  async searchSale(page, limit, query) {
    const items = this.model.aggregate([
      {
        $match: { quantity: { $gt: 0 } }
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft'
        }
      },
      {
        $unwind: "$nft"
      },
      {
        $project: {
          id: "$nft._id",
          name: "$nft.name",
          supply: "$nft.supply",
          image: "$nft.image",
          tokenId: "$nft.tokenId",
          collectionId: "$nft.collectionId",
          creator: "$nft.creator",
          quantity: "$quantity",
          endTime: "$endTime",
          unitPrice: "$unitPrice",
          saleType: "$saleType",
          seller: "$seller",
          type: "$nft.fileType",
          typeOrigin: "$nft.originType",
        }
      },
      {
        $match: {
          name: { $regex: '.*' + query.search + '.*', $options: 'i' }
        }
      },
      {
        $skip: (page - 1) * parseInt(limit)
      },
      {
        $limit: parseInt(limit)
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);
    
    return {
      items: await items.exec(),
      paginate: {
        page: page,
        size: limit,
      },
    };
  }

  async findById(id: ID) {
    const findQuery = this.model.aggregate(
      [
        {
          $lookup:
          {
            from: "nfts",
            localField: "nft",
            foreignField: "_id",
            as: "nft"
          }
        },
        {
          $unwind: "$nft"
        },
        {
          $lookup:
          {
            from: "users",
            localField: "nft.creator",
            foreignField: "_id",
            as: "creator"
          }
        },
        {
          $unwind: "$creator"
        },
        {
          $lookup:
          {
            from: "users",
            localField: "seller",
            foreignField: "_id",
            as: "seller"
          }
        },
        {
          $unwind: "$seller"
        },
        {
          $project: {
            _id: 1,
            image: "$nft.image",
            name: "$nft.name",
            fileType: "$nft.fileType",
            minBid: 1,
            createdAt: 1,
            endTime: 1,
            feature: 1,
            ownership: 1,
            quantity: 1,
            saleType: 1,
            unitPrice: 1,
            updatedAt: 1,
            royalty: "$nft.royalty",
            seller: "$seller.title",
            id: "$_id"
          }
        },
        {
          $addFields:
          {
            id: { $toString: "$id" },
          }
        },
        {
          $match: {
            id: id
          }
        }
      ]
    );
  }
  async findBySellerAndNft(sellerId: any, nftId: any) {
    return this.model.findOne({ seller: sellerId, nft: nftId });
  }

  async findByAuctionId(auctionId: number) {
    return this.model.findOne({ auctionId });
  }

  async update(id: ID, nftSale: UpdateNFTSaleDto): Promise<Sale> {
    const findNftSale = await this.model.findById(id);
    if (!findNftSale) {
      throw new HttpException('Nft sale not found', HttpStatus.NOT_FOUND);
    }
    return await this.model.findByIdAndUpdate(id, nftSale, { new: true });
  }

  async putOnSale(payload: SaleNFTDto, sellerId: ID) {
    const ownership = await this.ownershipService.findByOwnerAndNft(
      sellerId,
      payload.nftId,
    );
    if (!ownership || ownership.amount < payload.quantity) {
      throw new HttpException(
        'Seller not have enough ownership of this NFT',
        HttpStatus.BAD_REQUEST,
      );
    }

    const sale = await this.findBySellerAndNft(sellerId, payload.nftId);
    if (sale) {
      sale.quantity = payload.quantity;
      sale.unitPrice = payload.unitPrice;
      return sale.save();
    }

    return this.model.create({
      seller: sellerId,
      ownership,
      nft: payload.nftId,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice,
      minBid: payload.minBid,
      endTime: payload.endTime,
      saleType: payload.saleType,
      chainId: payload.chainId,
    });
  }

  async takeDown(tokenAddress, tokenId, seller, chainId) {
    const nft = await this.nftService.findByToken(
      tokenAddress,
      tokenId,
      chainId,
    );

    if (!nft) {
      this.logger.error(`NFT ${tokenAddress} ${tokenId} not found in database`);
      return;
    }

    const userSeller = await this.userService.findOrCreateByAddress(seller);
    const sale = await this.findBySellerAndNft(userSeller.id, nft.id);
    sale.quantity = 0;
    return sale.save();
  }

  async buy(saleId: ID, buyerId: ID, quantity: number) {
    const sale = await this.model.findById(saleId);
    if (!sale) {
      throw new HttpException('Sale not found', HttpStatus.NOT_FOUND);
    }

    console.log(quantity, 'quantity');
    if (sale.quantity < quantity) {
      throw new HttpException(
        'Sale not have enough quantity',
        HttpStatus.BAD_REQUEST,
      );
    }

    sale.quantity -= quantity;
    await sale.save();
    return sale;
  }

  getInSaleByUser(userId: any) {
    return this.model
      .find({ seller: userId, quantity: { $gt: 0 } })
      .populate('nft');
  }

  getInSaleNft(nftId: any) {
    return this.model
      .find({ nft: nftId, quantity: { $gt: 0 } })
      .populate('seller');
  }

  async onAucitonEnded(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _maxBidder, _maxBid, _amount, _success] =
      eventArgs;

    if (_success) {
      return this.onBought(
        [_address, _id, _seller, _amount, _maxBid, _maxBidder],
        chainId,
      );
    } else {
      return this.takeDown(_address, _id, _seller, chainId);
    }
  }

  async onItemUpdated(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _amount, _price, _type, _endTime] =
      eventArgs;
    this.logger.verbose(
      `Item updated: ${_address} ${_id} ${_seller} ${_amount} ${_price} ${_type} ${_endTime}`,
    );

    const nft = await this.nftService.findByToken(_address, _id, chainId);
    if (!nft) {
      this.logger.error(
        `NFT ${_address} ${_id}, chain ${chainId} not found in database`,
      );
      return;
    }
    const saleDto: SaleNFTDto = {
      nftId: nft.id.toString(),
      quantity: +_amount,
      unitPrice: +_price / 1e18,
      minBid: +_price / 1e18,
      endTime: +_endTime,
      saleType: +_type,
      chainId: chainId,
    };

    const user = await this.userService.findOrCreateByAddress(_seller);
    return this.putOnSale(saleDto, user.id);
  }

  async onBought(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _amount, _price, _buyer] = eventArgs;
    this.logger.verbose(
      `Item bought: ${_address} ${_id} ${_seller} ${_amount} ${_price} ${_buyer}`,
    );

    const nft = await this.nftService.findByToken(_address, _id, chainId);
    if (!nft) {
      this.logger.error(
        `NFT ${_address} ${_id}, ${chainId} not found in database`,
      );
      return;
    }

    const userSeller = await this.userService.findOrCreateByAddress(_seller);
    const userBuyer = await this.userService.findOrCreateByAddress(_buyer);

    const sale = await this.findBySellerAndNft(userSeller.id, nft.id);
    await this.buy(sale.id, userBuyer.id, +_amount);
  }

  async getTopSeller() {
    const findQuery = this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'seller',
          foreignField: '_id',
          as: 'sell',
        },
      },
      // { $group: { _id: { seller: '$sell' }, total: { $count: {} } } },
      { $group: { _id: { seller: '$sell' } } },
      { $sort: { total: -1 } },
      { $limit: 15 },
    ]);

    return await findQuery.exec();
  }

  async getFeature() {
    return this.model.find({ feature: true }).populate('nft');
  }

  async findByCollection(id: ID) {
    const coll = await this.collectionService.findOne(id);
    const findQuery = this.model.aggregate([
      {
        $match: {
          quantity: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'nfts',
          localField: 'nft',
          foreignField: '_id',
          as: 'nft',
        },
      },
      {
        $unwind: '$nft',
      },
      {
        $project: {
          id: "$nft._id",
          name: "$nft.name",
          supply: "$nft.supply",
          image: "$nft.image",
          tokenId: "$nft.tokenId",
          collectionId: "$nft.collectionId",
          creator: "$nft.creator",
          quantity: "$quantity",
          endTime: "$endTime",
          unitPrice: "$unitPrice",
          saleType: "$saleType",
          seller: "$seller",
          type: "$nft.fileType",
          typeOrigin: "$nft.originType",

        }
      },
      {
        $match: {
          collectionId: coll._id,
        },
      },
    ]);

    return await findQuery.exec();
  }

  async putOnSaleLazy(payload: CreateLazyNFTDto) {
    const nft = await this.nftService.createLazyNFT(
      payload.tokenAddress,
      payload.chainId,
      payload.signature,
      payload,
    );
    const ownership = await this.ownershipService.findByOwnerAndNft(
      nft.creator,
      nft._id,
    );

    const sale = await this.findBySellerAndNft(nft.creator, nft._id);
    if (sale) {
      sale.quantity = payload.supply;
      sale.unitPrice = payload.price;
      return sale.save();
    }

    return this.model.create({
      seller: nft.creator,
      ownership,
      nft: nft._id,
      quantity: payload.supply,
      unitPrice: payload.price,
      minBid: payload.price,
      endTime: payload.endTime,
      saleType: payload.saleType,
      chainId: payload.chainId,
      auctionId: payload.auctionId,
    });
  }

  async takeDownLazy(id) {
    const sale = await this.model.findById(id).populate('nft');
    if (!sale) {
      throw new HttpException(`Sale ${id} not found`, HttpStatus.NOT_FOUND);
    }
    const nft: NFT = sale.nft as NFT;
    if (!nft || !nft.isLazy) {
      throw new HttpException(`NFT ${nft.id} not found`, HttpStatus.NOT_FOUND);
    }
    const ownership = await this.ownershipService.findByOwnerAndNft(
      nft.creator,
      nft.id,
    );
    // delete sale
    await this.model.deleteOne({ _id: id });
    await this.nftService.deleteNft(nft.id);
    await this.ownershipService.deleteOwnership(ownership.id);
    return sale;
  }

  async onLazyAucitonEnded(eventArgs: ethers.utils.Result, chainId: number) {
    const [
      _address,
      _auctionId,
      _seller,
      _maxBidder,
      _maxBid,
      _amount,
      _success,
      _tokenId,
    ] = eventArgs;
    const sale = await this.findByAuctionId(_auctionId);
    console.log('ok');
    const bidder = await this.userService.findOrCreateByAddress(_maxBidder);

    if (_success) {
      await this.buy(sale.id, bidder.id, +_amount);
    } else {
      await this.takeDownLazy(sale.id);
    }
  }
}

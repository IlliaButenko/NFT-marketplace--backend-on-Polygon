import { log } from 'util';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateCollectionDto } from './dtos/createCollection.dto';
import { Collection } from './schemas/collection.schema';
import { InjectModel } from 'nestjs-typegoose';
import { abi as CollectionABI } from 'src/nft/contracts/HaveFeeCollection.json';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryCollectionDto } from './dtos/queryCollection.dto';
import { PaginateResponse } from 'src/global/interfaces/paginate.interface';
import { UpdateCollectionDto } from './dtos/updateCollection.dto';
import { ID } from '../global/interfaces/id.interface';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection)
    private readonly model: ReturnModelType<typeof Collection>,
    private readonly configService: ConfigService,
  ) {}

  public getContract(address, chainId) {
    const endpoint = this.configService.get('PRC_MATIC_URL');
    const rpcProvider = new ethers.providers.JsonRpcProvider(endpoint);

    return new ethers.Contract(address, CollectionABI, rpcProvider);
  }

  async findAll(
    query: QueryCollectionDto,
  ): Promise<PaginateResponse<Collection>> {
    const findQuery = this.model.find().populate('creator');
    if (query.search) {
      findQuery.or([
        { name: { $regex: '.*' + query.search + '.*', $options: 'i' } },
      ]);
    }
    if("status" in query){      
      findQuery.where({ [query.status]: true });
    }
    if ('activated' in query) {
      findQuery.where({ activated: query.activated });
    }
    const count = await this.model.find().merge(findQuery).countDocuments();
    findQuery
      .sort({ [query.sortBy]: query.sortType })
      .skip(query.page * query.size)
      .limit(query.size);

    return {
      items: await findQuery.exec(),
      paginate: {
        page: query.page,
        size: query.size,
        count,
      },
    };
  }

  async findOne(id: ID) {
    return await this.model.findById(id).exec();
  }

  async findOrCreateByAddress(address: string, chainId: number) {
    let collection = await this.findByAddress(address, chainId);
    if (!collection) {
      collection = await this.createByAddress(address, chainId);
    }
    return collection;
  }

  async findByAddress(address: string, chainId: number) {
    return this.model.findOne({
      address: address.toLowerCase(),
      chainId,
    });
  }

  async create(collection: CreateCollectionDto, userId: string) {
    return this.model.create({
      ...collection,
      address: collection.address.toLowerCase(),
      creator: userId,
    });
  }

  async createByAddress(address: string, chainId: number) {
    const contract = await this.getContract(address, chainId);
    let [name, symbol, owner] = ['', '', ''];

    try {
      name = await contract.name();
      symbol = await contract.symbol();
      owner = await contract.owner();
    } catch (e) {
      console.log('Error', e);
    }

    return this.model.create({
      owner,
      name,
      symbol,
      address: address.toLowerCase(),
      chainId: chainId,
    });
  }

  async remove(id: ID): Promise<Collection> {
    return this.model.findByIdAndRemove(id);
  }

  async update(id: ID, payload: UpdateCollectionDto) {
    return this.model.findByIdAndUpdate(id, payload, { new: true });
  }

  async findByCreator(creatorId: any) {
    return this.model.find({ $or: [{ creator: creatorId }, { public: true }] });
  }
}

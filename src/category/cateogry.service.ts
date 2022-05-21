import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dtos/createCategory.dto';
import { NFT } from './schemas/category.schema';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryCategoryDto } from './dtos/queryCategory.dto';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { UpdateCategoryDto } from './dtos/updateCategory.dto';
import { ID } from '../global/interfaces/id.interface';

@Injectable()
export class CateogryService {
  constructor(
    @InjectModel(NFT)
    private readonly model: ReturnModelType<typeof NFT>,
  ) {}

  async findAll(query: QueryCategoryDto): Promise<PaginateResponse<NFT>> {
    const findQuery = this.model.find();
    if (query.search) {
      findQuery.or([
        { description: { $regex: '.*' + query.search + '.*', $options: 'i' } },
        { title: { $regex: '.*' + query.search + '.*', $options: 'i' } },
      ]);
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

  async findOne(id: ID): Promise<NFT> {
    return await this.model.findById(id).exec();
  }

  async create(category: CreateCategoryDto): Promise<NFT> {
    return this.model.create(category);
  }

  async remove(id: ID): Promise<NFT> {
    return this.model.findByIdAndRemove(id);
  }

  async update(id: ID, payload: UpdateCategoryDto) {
    return this.model.findByIdAndUpdate(id, payload, { new: true });
  }
}

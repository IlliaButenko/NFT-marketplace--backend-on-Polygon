import { Injectable } from '@nestjs/common';
import { CreateActivityDto } from './dtos/createActivity.dto';
import { Activity } from './schemas/activity.schema';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryActivityDto } from './dtos/queryActivity.dto';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { UpdateActivityDto } from './dtos/updateActivity.dto';
import { ID } from '../global/interfaces/id.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity)
    private readonly model: ReturnModelType<typeof Activity>,
    private readonly userService: UserService,
  ) {}

  async findAll(query: QueryActivityDto): Promise<PaginateResponse<Activity>> {
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

  async rank(query: QueryActivityDto){
    const timeRange = query.time * 24 * 60 * 60;
    const currentTime = Math.floor((new Date().getTime())/1000);
    const findQuery = this.model.aggregate([
      {$match: {
        time: { $gte: currentTime - timeRange},
        type: 2
      }},
      {$group:{
         _id: {id: '$collection_id', name: "$collection_name", image: "collection_image"},
        total: { $sum: '$price' }
      }},
      {
        $sort: {
          total: -1
        }
      }
    
    ]);
    return await findQuery.exec();
  }

  async findOne(id: ID): Promise<Activity> {
    return await this.model.findById(id).exec();
  }

  async create(activity: CreateActivityDto): Promise<Activity> {
    const date = Math.floor((new Date().getTime())/1000);
    return this.model.create({
      ...activity,
      time: date
    });
  }

  async remove(id: ID): Promise<Activity> {
    return this.model.findByIdAndRemove(id);
  }

  async update(id: ID, payload: UpdateActivityDto) {
    return this.model.findByIdAndUpdate(id, payload, { new: true });
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { QueryUserDto } from './dtos/query-user.dto';
import { PaginateResponse } from '../global/interfaces/paginate.interface';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ID } from '../global/interfaces/id.interface';
import * as crypto from 'crypto';
import { ethers } from 'ethers';
import { UserStatusEnum } from './interfaces/userStatus.enum';
import { v4 as uuidv4 } from 'uuid';
import { UserRoleEnum } from './interfaces/userRole.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly model: ReturnModelType<typeof User>,
  ) { }

  async findAll(query: QueryUserDto): Promise<PaginateResponse<User>> {
    const findQuery = this.model.find({ password: null });
    if (query.search) {
      findQuery.or([
        { username: { $regex: '.*' + query.search + '.*', $options: 'i' } },
        { title: { $regex: '.*' + query.search + '.*', $options: 'i' } },
      ]);
    }

    if (query.status) {
      findQuery.where('status', query.status);
    }

    const count = await this.model.find().merge(findQuery).countDocuments();
    findQuery
      .select('-password')
      .sort({ [query.sortBy]: query.sortType ?? 'desc' })
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
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOneById(id: ID) {
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOwner(id: string) {
    return await this.model.findById(id, { password: 0 }).exec();
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.model.findOne({ email: email }, { password: 0 }).exec();
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return await this.model.findOne({ username }).exec();
  }

  async create(registerUser: RegisterUserDto): Promise<User> {
    const user = await this.model.findOne({ username: registerUser.username });

    if (user)
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);

    const newUser = new this.model(registerUser);
    newUser.password = await bcrypt.hash(registerUser.password, 10);

    const created = await newUser.save();
    return this.findOne(created.id);
  }

  async remove(id: ID): Promise<User> {
    return this.model.findByIdAndRemove(id);
  }

  async update(id: ID, payload: UpdateUserDto) {
    if (payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }
    if (payload.address) {
      payload.address = payload.address.toUpperCase();
    }
    await this.model.findByIdAndUpdate(id, payload, { new: true });
    return this.findOne(id);
  }

  async createOrUpdate(payload: UpdateUserDto) {
    if (!payload.address)
      throw new HttpException(
        'address is undefined',
        HttpStatus.BAD_REQUEST,
      );
    payload.address = payload.address.toUpperCase();

    const user = await this.model.findOne({
      address: payload?.address,
    });
    if (user) {
      console.log('in update', user._id, payload);
      return this.update(user._id, payload);
    }
    const newUser = new this.model(payload);
    const created = await newUser.save();
    return this.findOne(created.id);
  }

  async findOrCreateByAddress(address: string) {
    let sender = await this.findByAddress(address);
    if (!sender) {
      sender = await this.createByAddress(address);
    }
    return sender;
  }

  async findByAddress(address: string) {
    return this.model.findOne({
      address: address.toUpperCase(),
    });
  }

  async createByAddress(address: string) {
    return this.model.create({
      address: address.toUpperCase(),
      username: address,
      password: Date.now().toString(),
      email: '',
      title: 'admin',
      status: UserStatusEnum.ACTIVE,
      avatar: '',
      cover: '',
      role: UserRoleEnum.USER,
      isCreator: false,
    });
  }

  async follow(subjectId: ID, objectId: ID) {
    const subject = await this.findOne(subjectId);
    const object = await this.findOne(objectId);

    if (!subject.followeds.includes(object._id)) {
      subject.followeds.push(object);
      await subject.save();
    }
    if (!object.followers.includes(subject._id)) {
      object.followers.push(subject);
      await object.save();
    }
    return subject;
  }

  async unFollow(subjectId: ID, objectId: ID) {
    const subject = await this.findOne(subjectId);
    const object = await this.findOne(objectId);

    if (subject.followeds.includes(object._id)) {
      subject.followeds = subject.followeds.filter(
        (item) => !object._id.equals(item),
      );
      console.log(subject.followeds, object._id);
      await subject.save();
    }
    if (object.followers.includes(subject._id)) {
      object.followers = object.followers.filter(
        (item) => !subject._id.equals(item),
      );
      await object.save();
    }
    return subject;
  }

  async generateOnceFromAddress(address: string) {
    const user = await this.findByAddress(address);
    if (user) {
      let nonce = crypto.randomBytes(16).toString('base64');
      nonce = ethers.utils.formatBytes32String(nonce);
      user.nonce = nonce;
      await user.save();
      return nonce;
    }

    let nonce = crypto.randomBytes(16).toString('base64');
    nonce = ethers.utils.formatBytes32String(nonce);

    const newUser = new this.model({
      address: address.toUpperCase(),
      username: uuidv4(),
      title: 'Unnamed',
      status: UserStatusEnum.ACTIVE,
      nonce,
    });
    await newUser.save();
    return nonce;
  }
}

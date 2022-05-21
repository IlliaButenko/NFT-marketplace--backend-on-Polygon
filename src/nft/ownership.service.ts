import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Ownership } from './schemas/ownership.schema';

@Injectable()
export class OwnershipService {
  constructor(
    @InjectModel(Ownership)
    public readonly model: ReturnModelType<typeof Ownership>,
  ) {}

  private async takeAway(from: string, nftId: string, quantity: number) {
    const fromOwnership = await this.findByOwnerAndNft(from, nftId);
    if (!fromOwnership) {
      throw new HttpException('From Ownership not found', HttpStatus.NOT_FOUND);
    }

    if (fromOwnership.amount < quantity) {
      throw new HttpException(
        'Quantity is greater than the quantity of the ownership',
        HttpStatus.BAD_REQUEST,
      );
    }
    fromOwnership.amount -= quantity;
    await fromOwnership.save();
  }

  async findByOwnerAndNft(owner: any, nft: any) {
    return this.model.findOne({
      owner,
      nft,
    });
  }

  async transfer(from: any, to: any, nftId: any, quantity: number) {
    if (+from !== 0) {
      await this.takeAway(from, nftId, quantity);
    }
    const toOwnership = await this.findByOwnerAndNft(to, nftId);

    if (!toOwnership) {
      return this.model.create({
        owner: to,
        nft: nftId,
        amount: quantity,
      });
    }

    toOwnership.amount += quantity;
    return await toOwnership.save();
  }

  async getOwnedByUser(userId: any) {
    return this.model
      .find({ owner: userId, amount: { $gt: 0 } })
      .populate({
        path: 'nft',
        populate: {
          path: 'collectionId',
        }
      })
  }

  async deleteOwnership(id: any) {
    return this.model.findByIdAndDelete(id);
  }
}

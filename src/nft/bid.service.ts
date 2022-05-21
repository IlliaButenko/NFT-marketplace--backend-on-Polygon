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
import { Bid } from './schemas/bid.schema';
import { SaleService } from './sale.service';
import { chain } from 'lodash';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class BidService {
  private readonly logger = new Logger('Bid service');

  constructor(
    @InjectModel(Bid)
    private readonly model: ReturnModelType<typeof Bid>,
    private readonly ownershipService: OwnershipService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly eventService: EventService,
    private readonly saleService: SaleService,
    @Inject(forwardRef(() => NftService))
    private nftService: NftService,
  ) {}

  async findBySale(saleId: any) {
    return this.model.find({ sale: saleId }).populate('bidder');
  }

  async create(saleId: any, nftId: any, bidderId: any, value: number) {
    const bid = await this.model.findOne({
      sale: saleId,
      bidder: bidderId,
      nft: nftId,
    });

    if (bid && value > bid.value) {
      bid.value = value;
      return await bid.save();
    }

    return this.model.create({
      sale: saleId,
      bidder: bidderId,
      nft: nftId,
      value,
    });
  }

  async onBidAdded(eventArgs: ethers.utils.Result, chainId: number) {
    const [_address, _id, _seller, _bidder, _value] = eventArgs;
    this.logger.verbose(
      `Bid added: ${_address} ${_id} ${_seller} ${_bidder} ${_value}`,
    );

    const nft = await this.nftService.findByToken(_address, _id, chainId);
    if (!nft) {
      this.logger.error(
        `NFT ${_address} ${_id}, ${chainId} not found in database`,
      );
      return;
    }

    const sellerUser = await this.userService.findOrCreateByAddress(_seller);
    const bidderUser = await this.userService.findOrCreateByAddress(_bidder);

    const sale = await this.saleService.findBySellerAndNft(
      sellerUser.id,
      nft.id,
    );
    if (!sale) {
      this.logger.error(
        `Sale ${sellerUser.id} ${nft.id} not found in database`,
      );
      return;
    }

    await this.create(sale.id, nft.id, bidderUser.id, +_value / 1e18);
  }

  async onLazyBidAdded(eventArgs: ethers.utils.Result, chainId: number) {
    // event LazyBidAdded(address _address, uint256 _auctionId, address _seller, address _bidder, uint256 _value);
    const [_address, _auctionId, _seller, _bidder, _value] = eventArgs;
    this.logger.verbose(
      `Lazy Bid added: ${_address} ${_auctionId} ${_seller} ${_bidder} ${_value}`,
    );

    const bidderUser = await this.userService.findOrCreateByAddress(_bidder);

    const sale = await this.saleService.findByAuctionId(+_auctionId);
    if (!sale) {
      this.logger.error(`Sale lazy ${_auctionId} not found in database`);
      return;
    }

    await this.create(sale.id, sale.nft, bidderUser.id, +_value / 1e18);
  }
}

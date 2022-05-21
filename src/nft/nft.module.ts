import { forwardRef, Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { NftService } from './nft.service';
import { NftController } from './nft.controller';
import { NFT } from './schemas/nft.schema';
import { HelperModule } from 'src/helper/helper.module';
import { OwnershipService } from './ownership.service';
import { Ownership } from './schemas/ownership.schema';
import { Sale } from './schemas/sale.schema';
import { SaleService } from './sale.service';
import { Metadata } from './schemas/meta.schema';
import { MetadataService } from './metadata.service';
import { EventModule } from '../event/event.module';
import { Bid } from './schemas/bid.schema';
import { BidService } from './bid.service';
import { CollectionModule } from 'src/collection/collection.module';
import { UserModule } from 'src/user/user.module';
import { ContractService } from './contracts/contract.service';
import { CrawlService } from './crawl.service';
import { Collection } from 'src/collection/schemas/collection.schema';
import { CollectionService } from 'src/collection/collection.service';

@Module({
  imports: [
    TypegooseModule.forFeature([NFT, Ownership, Sale, Metadata, Bid, Collection]),
    HelperModule,
    EventModule,
    CollectionModule,
    forwardRef(() => UserModule),
  ],
  controllers: [NftController],
  providers: [
    NftService,
    OwnershipService,
    SaleService,
    MetadataService,
    BidService,
    ContractService,
    CrawlService,
    CollectionService
  ],
  exports: [NftService, OwnershipService],
})
export class NftModule {}

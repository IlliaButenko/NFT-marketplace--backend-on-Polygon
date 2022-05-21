import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { NftService } from './nft.service';
import { EventService } from '../event/event.service';
import { ContractService } from './contracts/contract.service';
import { SaleService } from './sale.service';
import { BidService } from './bid.service';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger('CrawlService');

  constructor(
    private readonly eventService: EventService,
    private nftService: NftService,
    private saleService: SaleService,
    private bidService: BidService,
    private contractService: ContractService,
  ) { }

  async crawlTransaction(chainId: number, txHash: string, collectionAddress) {
    const logs = await this.contractService.getAllEvents(
      chainId,
      collectionAddress,
      txHash,
    );
    let eventsConfirmed = 0;
    console.log(logs, 'log..');

    for await (const log of logs) {
      const event = await this.eventService.findOrCreate(log, txHash, chainId);
      console.log(event.confirmed);
      if (!event.confirmed) {
        await this.handleEvent(log, chainId, collectionAddress, txHash);
        await this.eventService.confirm(txHash, log.name, chainId, log.index);
        eventsConfirmed++;
      }
    }
    return eventsConfirmed;
  }

  async handleEvent(
    eventLog: ethers.utils.LogDescription,
    chainId: number,
    contractAddress: string,
    txHash: string,
  ) {
    switch (eventLog.name) {
      case 'TransferSingle':
        const collectionContract = this.contractService.getCollectionContract(
          chainId,
          contractAddress,
        );

        const transactionInfo = await this.contractService.getTransactionInfo(
          chainId,
          txHash,
        );
        if (
          transactionInfo.name &&
          ['buyLazy', 'endAuctionLazy'].includes(transactionInfo.name)
        ) {
          await this.nftService.onTransferSingle(
            eventLog.args,
            chainId,
            collectionContract,
            true,
            transactionInfo.args._signature,
          );
        } else {
          await this.nftService.onTransferSingle(
            eventLog.args,
            chainId,
            collectionContract,
          );
        }

        break;
      case 'ItemUpdated':
        await this.saleService.onItemUpdated(eventLog.args, chainId);
        break;
      case 'Bought':
        await this.saleService.onBought(eventLog.args, chainId);
        break;
      case 'BidAdded':
        await this.bidService.onBidAdded(eventLog.args, chainId);
        break;
      case 'AuctionEnded':
        await this.saleService.onAucitonEnded(eventLog.args, chainId);
        break;
      case 'LazyBidAdded':
        await this.bidService.onLazyBidAdded(eventLog.args, chainId);
        break;
      case 'LazyAuctionEnded':
        console.log('event');
        await this.saleService.onLazyAucitonEnded(eventLog.args, chainId);
        break;
    }
  }
}

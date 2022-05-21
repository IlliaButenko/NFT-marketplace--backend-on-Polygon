import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { abi as CollectionABI } from './HaveFeeCollection.json';
import { abi as MarketABI } from './Marketplace.json';

@Injectable()
export class ContractService {
  public chainIds: number[] = [];
  public prcUrls: string[] = [];
  public marketAddresses: string[] = [];
  public collectionEvents = ['TransferSingle', 'TransferBatch'];
  public marketEvents = [
    'AuctionEnded',
    'BidAdded',
    'Bought',
    'ItemUpdated',
    'LazyAuctionEnded',
    'LazyBidAdded',
    'AuctionEnded',
    'BidAdded',
  ];

  constructor(private readonly configService: ConfigService) {
    const chainIds = this.configService.get<string>('CHAIN_IDS');
    this.chainIds = chainIds.split(',').map((id) => parseInt(id, 10));
    this.chainIds.forEach((id, index) => {
      this.prcUrls.push(this.configService.get<string>(`PRC_URL_${index}`));
      this.marketAddresses.push(
        this.configService.get<string>(`MARKET_ADDRESS_${index}`),
      );
    });
  }

  public getCollectionContract(chainId: number, collectionAddress: string) {
    const rpcProvider = this.chainToProvider(chainId);
    return new ethers.Contract(collectionAddress, CollectionABI, rpcProvider);
  }

  public getMarketContract(chainId: number) {
    const rpcProvider = this.chainToProvider(chainId);
    const marketAddress = this.chainIdToMarketAddress(chainId);
    return new ethers.Contract(marketAddress, MarketABI, rpcProvider);
  }

  public chainIdToPRC(chainId: number) {
    return this.prcUrls[this.chainIds.indexOf(chainId)];
  }

  public chainIdToMarketAddress(chainId: number) {
    const chainIds = this.configService.get<string>('CHAIN_IDS');
    this.chainIds = chainIds.split(',').map((id) => parseInt(id, 10));
    return this.marketAddresses[this.chainIds.indexOf(chainId)];

  }

  public chainToProvider(chainId: number) {
    const prc = this.chainIdToPRC(chainId);
    return new ethers.providers.JsonRpcProvider(prc);
  }

  public async getTransactionReceipt(chainId: number, txHash: string) {
    const rpcProvider = this.chainToProvider(chainId);
    const tx = await rpcProvider.getTransaction(txHash);
    return await tx.wait();
  }

  public async getTransactionInfo(chainId: number, txHash: string) {
    try {
      const rpcProvider = this.chainToProvider(chainId);
      const tx = await rpcProvider.getTransaction(txHash);
      const data = tx.data;
      const iface = new ethers.utils.Interface(MarketABI);
      return iface.parseTransaction({ data });
    } catch (e) {
      return { args: { _signature: '' }, name: '' };
    }
  }


  public async getCollectionEvents(chainId: number, address: string, txHash: string,) {
    const txReceipt = await this.getTransactionReceipt(chainId, txHash);
    const iface = new ethers.utils.Interface(CollectionABI);
    const logs = txReceipt.logs.filter((log) => log.address.toLowerCase() == address.toLowerCase(),);
    return logs
      .map((log) => iface.parseLog(log))
      .map((log, index) => ({
        ...log,
        address,
        index,
      }));
  }

  public async getMarketEvents(chainId: number, txHash: string) {
    const address = this.chainIdToMarketAddress(chainId);
    const txReceipt = await this.getTransactionReceipt(chainId, txHash);
    const iface = new ethers.utils.Interface(MarketABI);
    const logs = txReceipt.logs.filter((log) => log.address.toLowerCase() === address.toLowerCase(),);
    return logs
      .map((log) => iface.parseLog(log))
      .map((log, index) => ({
        ...log,
        address,
        index,
      }));
  }

  public async getAllEvents(chainId: number, collectionAddress: string, txHash: string,) {
    const collectionEvents = await this.getCollectionEvents(
      chainId,
      collectionAddress,
      txHash,
    );
    const marketEvents = await this.getMarketEvents(chainId, txHash);
    return [...collectionEvents, ...marketEvents];
  }

  public async getBlockNumber(chainId: number, txHash: string) {
    const rpcProvider = this.chainToProvider(chainId);
    const tx = await rpcProvider.getTransaction(txHash);
    await tx.wait();
    return tx.blockNumber;
  }
}

import { NftStatusEnum } from './nftStatus.enum';

export interface NftFilterInterface {
  search?: string;
  activated?: boolean;
  status?: NftStatusEnum;
}

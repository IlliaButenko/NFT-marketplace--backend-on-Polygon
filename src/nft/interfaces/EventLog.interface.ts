import { ethers } from 'ethers';

export interface EventLogInterface extends ethers.utils.LogDescription {
  address: string;
  index: number;
}

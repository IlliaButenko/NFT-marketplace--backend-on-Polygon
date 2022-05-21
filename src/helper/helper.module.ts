import { Module } from '@nestjs/common';
import { IpfsService } from './ipfs.service';

@Module({
  imports: [],
  providers: [IpfsService],
  exports: [IpfsService],
})
export class HelperModule {}

import { Module } from '@nestjs/common';
import { NFT } from './schemas/category.schema';
import { CategoryController } from './category.controller';
import { CateogryService } from './cateogry.service';
import { TypegooseModule } from 'nestjs-typegoose';

@Module({
  imports: [TypegooseModule.forFeature([NFT])],
  controllers: [CategoryController],
  providers: [CateogryService],
  exports: [CateogryService],
})
export class CategoryModule {}

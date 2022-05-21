import { Module } from '@nestjs/common';
import { Collection } from './schemas/collection.schema';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { TypegooseModule } from 'nestjs-typegoose';

@Module({
  imports: [TypegooseModule.forFeature([Collection])],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}

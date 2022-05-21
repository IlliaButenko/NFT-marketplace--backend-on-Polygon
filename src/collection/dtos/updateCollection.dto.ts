import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectionDto } from './createCollection.dto';

export class UpdateCollectionDto extends PartialType(CreateCollectionDto) {}

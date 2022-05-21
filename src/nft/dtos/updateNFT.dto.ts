import { PartialType } from '@nestjs/mapped-types';
import { CreateNFTDto } from './createNFT.dto';

export class UpdateNFTDto extends PartialType(CreateNFTDto) {}

import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './createActivity.dto';

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

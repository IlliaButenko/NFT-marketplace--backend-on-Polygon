import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { QueryActivityDto } from './dtos/queryActivity.dto';
import { UpdateActivityDto } from './dtos/updateActivity.dto';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { CreateActivityDto } from './dtos/createActivity.dto';

// @UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @Get()
  async index(@Query() query: QueryActivityDto) {
    return await this.service.findAll(query);
  }

  @Get('/ranking')
  async ranking(@Query() query: QueryActivityDto) {
    return await this.service.rank(query);
  }

  @Get(':id')
  async find(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findOne(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.remove(id);
  }

  @Post()
  async create(@Body() payload: CreateActivityDto) {
    return await this.service.create(payload);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIdPipe) id: ID,
    @Body() payload: UpdateActivityDto,
  ) {
    return await this.service.update(id, payload);
  }
}

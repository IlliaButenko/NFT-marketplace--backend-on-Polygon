import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { EventService } from './event.service';
import { QueryWalletDto } from './dtos/queryEvent.dto';

@Controller('transaction')
export class EventController {
  constructor(private readonly service: EventService) {}

  @Get()
  async index(@Query() query: QueryWalletDto) {
    return await this.service.findAll(query);
  }

  @Get('activity')
  async activity(@Query('page') page = 1, @Query('limit') limit = 10) {
    return await this.service.activity(page, limit);
  }

  @Get('ranking')
  async ranking(@Query('page') page = 1, @Query('limit') limit = 10, @Query() query) {
    return await this.service.rankings(page, limit, query);
  }
  
  @Get(':id')
  async find(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findOne(id);
  }


}

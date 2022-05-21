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
import { CollectionService } from './collection.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Auth } from '../auth/decorator/auth.decorator';
import { QueryCollectionDto } from './dtos/queryCollection.dto';
import { UpdateCollectionDto } from './dtos/updateCollection.dto';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { CreateCollectionDto } from './dtos/createCollection.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Collection')
@Controller('collections')
export class CollectionController {
  constructor(private readonly service: CollectionService) {}

  @Get()
  async index(@Query() query: QueryCollectionDto) {
    return await this.service.findAll(query);
  }

  @Get(':id')
  async find(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findOne(id);
  }

  @Get('creator/:id')
  @ApiParam({ name: 'id' })
  async findByCreator(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.findByCreator(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIdPipe) id: ID) {
    return await this.service.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() payload: CreateCollectionDto, @Auth() user) {
    return await this.service.create(payload, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update collection' })
  @ApiParam({ name: 'id' })
  async update(
    @Param('id', ParseIdPipe) id: ID,
    @Body() payload: UpdateCollectionDto,
  ) {
    return await this.service.update(id, payload);
  }
}

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
import { CateogryService } from './cateogry.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { QueryCategoryDto } from './dtos/queryCategory.dto';
import { UpdateCategoryDto } from './dtos/updateCategory.dto';
import { ID } from '../global/interfaces/id.interface';
import { ParseIdPipe } from '../global/pipes/parseId.pipe';
import { CreateCategoryDto } from './dtos/createCategory.dto';

// @UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly service: CateogryService) {}

  @Get()
  async index(@Query() query: QueryCategoryDto) {
    return await this.service.findAll(query);
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
  async create(@Body() payload: CreateCategoryDto) {
    return await this.service.create(payload);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIdPipe) id: ID,
    @Body() payload: UpdateCategoryDto,
  ) {
    return await this.service.update(id, payload);
  }
}

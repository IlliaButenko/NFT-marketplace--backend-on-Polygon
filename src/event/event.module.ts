import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from './schemas/event.schema';

@Module({
  imports: [TypegooseModule.forFeature([Event])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}

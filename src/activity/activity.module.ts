import { Module } from '@nestjs/common';
import { Activity } from './schemas/activity.schema';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schema';
@Module({
  imports: [TypegooseModule.forFeature([Activity, User])],
  controllers: [ActivityController],
  providers: [ActivityService, UserService],
  exports: [ActivityService],
})
export class ActivityModule {}

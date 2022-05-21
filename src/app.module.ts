import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypegooseModule } from 'nestjs-typegoose';
import { UploadModule } from './upload/upload.module';
import { NftModule } from './nft/nft.module';
import { EventModule } from './event/event.module';
import { CategoryModule } from './category/category.module';
import { CollectionModule } from './collection/collection.module';
import { ActivityModule } from './activity/activity.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath:'.env.production', isGlobal: true }),
    TypegooseModule.forRoot(process.env.MONGO),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    UploadModule,
    NftModule,
    EventModule,
    CategoryModule,
    CollectionModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './modules/places/places.module';

import config from './config';
import auth0 from './config/auth0';
import s3 from './config/s3';

import { LogMiddleware } from './middleware/log.middleware';
import { Auth0Module } from './auth0/auth0.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    // Configuration (made global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config, auth0, s3],
    }),
    // MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfgService: ConfigService) => ({
        uri: cfgService.get<string>('dbURL'),
      }),
    }),
    PlacesModule,
    Auth0Module,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlacesModule } from './modules/places/places.module';

import config from './config';
import { LogMiddleware } from './middleware/log.middleware';
import { Auth0Module } from './auth0/auth0.module';

@Module({
  imports: [
    // Configuration (made global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}

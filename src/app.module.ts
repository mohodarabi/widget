import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthenticationModule } from './authentication/authentication.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramModule } from './telegram/telegram.module';
import { WidgetModule } from './widget/widget.module';
import { EmailConfirmationModule } from './emailConfirmation/emailConfirmation.module'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'widget-ios'),
      serveRoot: '/widget-ios/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./config/.env.${process.env.NODE_ENV}`
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        return {
          uri: config.get<string>('DATABASE_URI'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      },
      inject: [ConfigService],
    }),
    AuthenticationModule,
    UsersModule,
    EmailConfirmationModule,
    WidgetModule,
    TelegramModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

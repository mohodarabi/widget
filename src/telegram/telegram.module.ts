import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramService } from './telegram.service';
import { UsersModule } from 'src/users/users.module';
import { WidgetModule } from 'src/widget/widget.module';

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                token: configService.get<string>('TELEGRAM_BOT_TOKEN'),
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        WidgetModule
    ],
    providers: [TelegramService],
    exports: [TelegramService]
})
export class TelegramModule { }

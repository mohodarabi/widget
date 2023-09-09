import { join } from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Update, Hears, Ctx, Start, Command, On } from 'nestjs-telegraf';
import { Context, Telegraf, Markup } from 'telegraf';
import { UserService } from 'src/users/users.service';
import { exec } from 'child_process';
import { WidgetService } from 'src/widget/widget.service';
import { v4 as uuid } from 'uuid';
const fs = require('fs');
const axios = require('axios');

@Injectable()
@Update()
export class TelegramService {
    private readonly bot: Telegraf;

    constructor(
        private configService: ConfigService,
        private userService: UserService,
        private readonly widgetService: WidgetService
    ) {
        this.bot = new Telegraf(configService.get<string>('TELEGRAM_BOT_TOKEN'));
        this.bot.command('menu', this.showMenu.bind(this));
    }

    async downloadFile(fileUrl: string, dist: string) {
        try {
            const response = await axios({
                method: 'get',
                url: fileUrl,
                responseType: 'stream', // Get the file as a stream
            });

            // Create a write stream to save the file
            const writer = fs.createWriteStream(dist);

            // Pipe the response data to the writer
            response.data.pipe(writer);

            // Wait for the write stream to finish
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            console.log('File downloaded successfully!');
        } catch (error) {
            console.error('Error downloading the file:', error);
        }
    }

    // @On('photo')
    // async on(@Ctx() ctx: any) {
    //     const filename = `${uuid()}.jpg`
    //     const dist = join(__dirname, '..', '..', 'widget-ios', 'upload', filename)

    //     if (ctx.message.from.username !== 'Zeynabkhoshnood' || ctx.message.from.id !== '164521636') return ctx.reply('you are not zeynab')

    //     const file_id = ctx.message.photo[ctx.message.photo.length - 1].file_id
    //     const fileInfo = await ctx.telegram.getFile(file_id);
    //     const fileUrl = `https://api.telegram.org/file/bot${this.configService.get<string>('TELEGRAM_BOT_TOKEN_DEV')}/${fileInfo.file_path}`;

    //     this.downloadFile(fileUrl, dist)

    //     this.widgetService.sendMessageToSingles(filename)
    // }

    @Start()
    async startCommand(@Ctx() ctx: Context) {
        await ctx.reply('Welcome, to widget-ios bot');
        await this.sendMenuOptions(ctx);
    }

    @Command('menu')
    async showMenu(@Ctx() ctx: Context) {
        await this.sendMenuOptions(ctx);
    }

    private async sendMenuOptions(ctx: Context) {
        const keyboard = Markup.keyboard([
            ['send_content'],
            ['request', 'users'],
            ['category'],
        ]).resize()
            .oneTime();

        await ctx.reply('Please select an option:', keyboard);
    }

    @Hears('request')
    async getAllRequests(@Ctx() ctx: Context) { }

    @Hears('users')
    async getUserInfo(@Ctx() ctx: Context) { }

    @Hears('category')
    async getCategoryInfo(@Ctx() ctx: Context) { }

}
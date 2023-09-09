import { Module } from '@nestjs/common';
import { WidgetController } from './widget.controller';
import { WidgetService } from './widget.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Widget, WidgetSchema } from './model/widget.schema';
import { Reaction, ReactionSchema } from './model/reaction.schema';
import { Content, ContentSchema } from './model/content.schema';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Widget.name, schema: WidgetSchema }
        ]),
        UsersModule,
        NotificationModule
    ],
    controllers: [WidgetController],
    providers: [WidgetService],
    exports: [WidgetService]
})

export class WidgetModule { }
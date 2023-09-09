import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose'
import * as mongoose from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import { Widget } from './model/widget.schema';
import { ConfigService } from '@nestjs/config';
import { Content } from './model/content.schema';
import ReactionType from './model/reaction-type.enum';
import ContentType from './model/content-type.enum';
import { CreateWidgetDtos } from './dtos/create-widget.dto';
import { UserService } from 'src/users/users.service';
import * as moment from 'moment';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class WidgetService {

    constructor(
        @InjectModel(Widget.name) private widgetModel: Model<Widget>,
        private userService: UserService,
        private readonly configService: ConfigService,
        private readonly notificationService: NotificationService

    ) { }

    // ============ UTILS ============

    isMyContentTypeEnum(value: any): value is ContentType {
        return Object.values(ContentType).includes(value);
    }

    isMyReactionTypeEnum(value: any): value is ReactionType {
        return Object.values(ReactionType).includes(value);
    }

    // ============ REPOSITORIES ============

    async create(data: Object) {
        const widget = await this.widgetModel.create(data)
        return widget.populate({ path: 'members' })
    }

    async findOneAndUpdate(widgetId: string, userId: string) {
        return this.widgetModel.findOneAndUpdate(
            { _id: widgetId },
            { $pull: { members: new mongoose.Types.ObjectId(userId) } },
            { new: true },)
            .populate({ path: 'members' })
    }

    async deleteOne(data: Object) {
        const widget = await this.widgetModel.findByIdAndDelete(data)
        return widget.populate({ path: 'members' })
    }

    async findById(widgetId: string) {
        return this.widgetModel.findById(widgetId).populate({ path: 'members' })
    }

    async findOne(data: Object) {
        return this.widgetModel.findOne(data).populate({ path: 'members' })
    }

    async find(data: Object) {
        return this.widgetModel.find(data).populate({ path: 'members' })
    }

    async findOneForShowReaction(data: Object) {
        return this.widgetModel.findOne(data).populate([
            { path: 'members' },
            { path: 'reactions.sender' }
        ])
    }

    async findOneForAppHistory(data: Object) {
        return this.widgetModel.findOne(data).populate({ path: 'contents.sender' })
    }

    async deleteUserFromWidgets(userId: string) {
        return this.widgetModel.updateMany(
            { members: userId },
            { $pull: { members: userId } },
        )
    }

    // ============ SERVICES ============

    async createWidget(data: CreateWidgetDtos, userId: string) {

        const user = await this.userService.findById(userId)
        if (!user) throw new BadRequestException('user not found')

        if (!data.friendId) {
            const createdWidget = await this.create({ ...data, creator: userId, members: [userId], isAlone: true })
            return createdWidget
        }

        const friend = await this.userService.findById(data.friendId)
        if (!friend) throw new BadRequestException('friend not found')

        const createdWidget = await this.create({ ...data, creator: userId, members: [userId, data.friendId], isAlone: false })

        user.widgets++
        await user.save()

        return createdWidget
    }

    async getHistoryInApp(userId: string, widgetId: string) {
        const widgets = await this.findOneForAppHistory({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })

        if (!widgets) throw new NotFoundException('widget not found')

        const contents: Array<any> = widgets.contents;

        contents.sort((a, b) => {
            const createdAtA: number = new Date(a.createdAt).getTime();
            const createdAtB: number = new Date(b.createdAt).getTime();
            return createdAtB - createdAtA;
        });

        const groupedContents: { [key: string]: Array<any> } = {};

        contents.forEach((content) => {
            const formattedCreatedAt = moment(content.createdAt).format('LT');

            const createdAt: Date = new Date(content.createdAt);
            const formattedDate: string = createdAt.toISOString().split('T')[0];

            if (!groupedContents[formattedDate]) {
                groupedContents[formattedDate] = [];
            }

            groupedContents[formattedDate].push(content);
        });

        const formattedContents: Array<{ showTime: string; data: Array<any> }> = Object.entries(
            groupedContents
        ).map(([date, data]) => ({
            showTime: moment(date).format('ll'),
            data,
        }));

        return formattedContents
    }

    async getHistoryInWidget(userId: string, widgetId: string) {
        const widget = await this.findOneForAppHistory({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })

        if (!widget) throw new NotFoundException('widget not found')
        const contents = widget.contents.filter((content: any) => content.sender.id.toString() !== userId)

        return contents
    }

    async deleteWidget(userId: string, widgetId: string) {
        const user = await this.userService.findById(userId)
        if (!user) throw new BadRequestException('user not found')

        let widget = await this.findOne({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })
        if (!widget) throw new NotFoundException('widget not found')

        const friendIds: any = widget.members.filter((member: any) => member.id.toString() !== userId)

        if (widget.creator.toString() === userId) {
            await this.widgetModel.deleteOne({ _id: widgetId })

            if (friendIds.length > 0) {
                const notif = await this.notificationService.sendPushNotification(friendIds[0].id, `"${user.username}" delete "$${widget.name}" widget`)
            }

            return widget
        }

        const newWidget = await this.findOneAndUpdate(widgetId, userId)
        newWidget.isAlone = true
        await newWidget.save()

        if (friendIds.length > 0) {
            const notif = await this.notificationService.sendPushNotification(friendIds[0].id, `"${user.username}" delete "$${widget.name}" widget`)
        }

        return newWidget
    }

    async homeWidget(userId: string) {
        let widgets = await this.find({ members: { $elemMatch: { $eq: userId } } })
        if (widgets.length === 0) return []

        let contents = []

        widgets.forEach(widget => {
            
            const filteredContents = widget.contents.filter((content: Content) => content.sender.toString() !== userId)
            
            let member = ''
            let filteredMembers: any = widget.members.filter((member: any) => member.id.toString() !== userId)
            if (filteredMembers.length > 0) { member = filteredMembers[0].username }
            
            let sortedContents: any = filteredContents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
            if (filteredContents.length === 0) { sortedContents = {} }
            
            contents.push({
                id: widget.id,
                name: widget.name,
                member,
                contents: sortedContents
            })
        })

        return contents
    }

    async singleWidget(userId: string, widgetId: string) {
        let widget: any = await this.findOne({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })
        if (!widget) throw new BadRequestException('widget not found')

        widget.contents = widget.contents.filter((content: Content) => content.sender.toString() !== userId)

        if (widget.contents > 0) {
            const sortedContents = widget.sort((a, b) => {
                const createdAtA: number = new Date(a.createdAt).getTime();
                const createdAtB: number = new Date(b.createdAt).getTime();
                return createdAtB - createdAtA;
            });
            widget.contents = sortedContents[0]
        }

        return widget
    }

    async addUserToWidget(creatorId: string, widgetId: string, userId: string) {
        let widget = await this.findOne({ _id: widgetId, creator: creatorId })
        if (!widget) throw new NotFoundException('widget not found')

        const members = widget.members.filter(member => member.toString() === userId)
        if (members.length > 0) throw new BadRequestException('user already added to members list')

        widget.members.push(userId)
        widget.isAlone = false
        await widget.save()
        return widget
    }

    async addReactionToWidget(userId: string, widgetId: string, contentId: string, type: ReactionType) {
        const user = await this.userService.findById(userId)
        if (!user) throw new BadRequestException('user not found')

        if (!this.isMyReactionTypeEnum(type)) throw new BadRequestException('wrong type')

        let widget = await this.findOne({ _id: widgetId, members: { $elemMatch: { $eq: userId } }, contents: { $elemMatch: { _id: { $eq: contentId } } } })
        if (!widget) throw new NotFoundException('widget not found')

        let contents = await this.widgetModel.aggregate([
            {
                $match: {
                    "_id": new mongoose.Types.ObjectId(widgetId)
                }
            },
            {
                $unwind: "$contents"
            },
            {
                $match: {
                    "contents._id": new mongoose.Types.ObjectId(contentId)
                }
            },
            {
                $project: {
                    _id: 0,
                    content: "$contents"
                }
            },
        ]);

        let contentObject = contents[0].content

        if (contents[0].content.sender.toString() === userId) throw new BadRequestException('you cannot add reaction to your own content')

        const reaction = widget.reactions.filter(reaction => reaction.sender.toString() === userId && reaction.contentId.toString() === contentId && reaction.type === type)

        if (reaction.length > 0) {
            await this.widgetModel.findOneAndUpdate(
                { _id: widgetId },
                { $pull: { reactions: { sender: userId, contentId, type: ReactionType[type.toUpperCase()] } } },
                { new: true },
            )
            contentObject.reaction--
            const newContents = await this.widgetModel.findOneAndUpdate(
                {
                    "_id": new mongoose.Types.ObjectId(widgetId),
                    "contents._id": new mongoose.Types.ObjectId(contentId)
                },
                {
                    $set: { "contents.$": contentObject }
                },
                { new: true }
            )

            return newContents;
        }

        widget.reactions.push({ sender: userId, contentId, type: ReactionType[type.toUpperCase()], createdAt: new Date(Date.now()) })
        await widget.save()

        contentObject.reaction++
        const newContents = await this.widgetModel.findOneAndUpdate(
            {
                "_id": new mongoose.Types.ObjectId(widgetId),
                "contents._id": new mongoose.Types.ObjectId(contentId)
            },
            {
                $set: { "contents.$": contentObject }
            },
            { new: true }
        )

        const friendIds: any = widget.members.filter((member: any) => member.id.toString() !== userId)
        if (friendIds.length > 0) {
            const notif = await this.notificationService.sendPushNotification(friendIds[0].id, `"${user.username}" delete "$${widget.name}" widget`)
        }

        return newContents
    }

    async showReactionToWidget(userId: string, widgetId: string, contentId: string) {
        let widget = await this.findOneForShowReaction({ _id: widgetId, members: { $elemMatch: { $eq: userId } }, contents: { $elemMatch: { _id: { $eq: contentId } } } })
        if (!widget) throw new NotFoundException('widget not found')

        const reactions = widget.reactions.filter(reaction => reaction.contentId.toString() === contentId)

        return reactions
    }

    async addContentToWidget(userId: string, widgetId: string, filename: string, type: ContentType) {
        const user = await this.userService.findById(userId)
        if (!user) throw new BadRequestException('user not found')

        if (!this.isMyContentTypeEnum(type)) throw new BadRequestException('wrong type')
        let widget = await this.findOne({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })
        if (!widget) throw new NotFoundException('widget not found')

        widget.contents.push({
            sender: userId,
            data: `${this.configService.get<String>('BASE_URL')}/upload/${filename}`,
            type: ContentType[type.toUpperCase()],
            createdAt: new Date(Date.now())
        })

        await widget.save()

        const friendIds: any = widget.members.filter((member: any) => member.id.toString() !== userId)
        if (friendIds.length > 0) {
            const notif = await this.notificationService.sendPushNotification(friendIds[0].id, `"${user.username}" delete "$${widget.name}" widget`)
        }

        return widget
    }

    async MissYou(userId: string, widgetId: string) {
        const user = await this.userService.findById(userId)
        if (!user) throw new BadRequestException('user not found')

        let widget = await this.findOne({ _id: widgetId, members: { $elemMatch: { $eq: userId } } })
        if (!widget) throw new NotFoundException('widget not found')

        widget.contents.push({
            sender: userId,
            data: `${this.configService.get<String>('BASE_URL')}/upload/reminderLarge.png`,
            type: ContentType.MISS,
            createdAt: new Date(Date.now())
        })

        await widget.save()

        const friendIds: any = widget.members.filter((member: any) => member.id.toString() !== userId)
        if (friendIds.length > 0) {
            const notif = await this.notificationService.sendPushNotification(friendIds[0].id, `"${user.username}" delete "$${widget.name}" widget`)
        }

        return widget
    }

    async getSingleWidget(widgetId: string) {
        let widget = await this.findOne({ _id: widgetId })
        if (!widget) throw new NotFoundException('widget not found')
        return widget
    }

}

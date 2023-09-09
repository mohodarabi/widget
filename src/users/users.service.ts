import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model/user.schema';
import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly configService: ConfigService,
        private notificationService: NotificationService,
    ) {
    }

    async create(data: Partial<User>) {
        return this.userModel.create(data)
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({ email })
    }

    async findById(id: string) {
        return this.userModel.findById(id)
    }

    async updateOne(id: string, data: Partial<User>) {
        const user = await this.userModel.findById(id)
        if (!user) throw new NotFoundException('user not found')
        return this.userModel.updateOne({ id }, data)
    }

    async deleteOne(id: string) {
        return this.userModel.deleteOne({ _id: id })
    }

    async updateProfile(id: string, data: string) {
        const user = await this.userModel.findById(id)
        if (!user) throw new NotFoundException('user not found')
        user.profileImage = data
        return user.save()
    }

    async addFriend(user: UserDocument, code: string) {
        if (!code) throw new BadRequestException('all credentials are required');

        if (user.code === code) throw new BadRequestException('you cannot add yourself to your friends list')

        const friendUser = await this.userModel.findOne({ code })
        if (!friendUser) throw new NotFoundException('friend not found')

        const friends = user.friends.filter(friend => friend.toString() === friendUser.id.toString())
        if (friends.length > 0) throw new BadRequestException('you already added to friend list')

        user.friends.push(friendUser.id)

        friendUser.friends.push(user.id)
        await friendUser.save()
        const notif = await this.notificationService.sendPushNotification(friendUser.id, `you added to "${user.username}" friend list`)
        return user.save()
    }

    async showFriends(userId: string) {
        const user = await this.userModel.findById(userId).populate({
            path: 'friends',
            select: 'username profileImage id'
        })
        if (!user) throw new NotFoundException('user not found')
        return user.friends
    }

    async deleteFriend(userId: string, friendId: string) {
        if (!friendId) throw new BadRequestException('all credentials are required');

        let user = await this.userModel.findOne({ _id: userId })
        if (!user) throw new BadRequestException('This user has no such friend')

        let friend = await this.userModel.findOne({ _id: userId, friends: { $elemMatch: { $eq: friendId } } })
        if (!friend) throw new BadRequestException('This user has no such friend')

        const newFriends = await this.userModel.findOneAndUpdate(
            { _id: userId },
            { $pull: { friends: new mongoose.Types.ObjectId(friendId) } },
            { new: true },
        )

        const newUserFriends = await this.userModel.findOneAndUpdate(
            { _id: friendId },
            { $pull: { friends: new mongoose.Types.ObjectId(userId) } },
            { new: true },
        )

        return newFriends
    }

    async searchUser(code: string) {
        const user = await this.userModel.findOne({ code })
        if (!user) throw new NotFoundException('user not found')
        return user
    }

    async editUsername(userId: string, username: string) {
        if (!username) throw new BadRequestException('all credentials are required');

        const user = await this.userModel.findById(userId)
        if (!user) throw new NotFoundException('user not found')
        user.username = username
        await user.save()
        return user
    }

    async sendNotif(userId: string) {
        if (!userId) throw new BadRequestException('all credentials are required');
        const notif = await this.notificationService.sendPushNotification(userId, ``)
        return notif
    }

}

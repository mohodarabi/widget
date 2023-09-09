import { Controller, UseGuards, Post, Req, Get, Res, Patch, UseInterceptors, UploadedFiles, Param, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import JwtAuthenticationGuard from 'src/authentication/accessToken/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';
import { UserService } from './users.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('widget-ios/user')
export class UsersController {

    constructor(private readonly userService: UserService) { }

    @Get('/get-me')
    @UseGuards(JwtAuthenticationGuard)
    async getUser(@Req() req: RequestWithUser, @Res() res: Response) {
        const user = await this.userService.findById(req.user.id)
        res.status(200).json({
            success: true,
            message: 'user data',
            data: user
        })

    }

    @Patch('/edit-username')
    @UseGuards(JwtAuthenticationGuard)
    async editUsername(@Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const { username } = req.body
        const userFriends = await this.userService.editUsername(user.id, username)
        res.status(200).json({
            success: true,
            message: 'user successfully added to friends',
            data: userFriends
        })

    }

    // ==================== FRIENDS ====================

    @Patch('/friends/add')
    @UseGuards(JwtAuthenticationGuard)
    async addFriend(@Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const { friendCode } = req.body
        const userFriends = await this.userService.addFriend(user, friendCode)
        res.status(200).json({
            success: true,
            message: 'user successfully added to friends',
            data: userFriends
        })

    }

    @Get('/friends/show')
    @UseGuards(JwtAuthenticationGuard)
    async showFriends(@Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const userFriends = await this.userService.showFriends(user.id)
        res.status(200).json({
            success: true,
            message: 'user successfully added to friends',
            data: userFriends
        })

    }

    @Delete('/friends/delete')
    @UseGuards(JwtAuthenticationGuard)
    async deleteFriends(@Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const { friendId } = req.body
        const userFriends = await this.userService.deleteFriend(user.id, friendId)
        res.status(200).json({
            success: true,
            message: 'friend successfully removed',
            data: userFriends
        })
    }

    @Get('/search/:code')
    @UseGuards(JwtAuthenticationGuard)
    async searchUser(@Param('code') code: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const userFriends = await this.userService.searchUser(code)
        res.status(200).json({
            success: true,
            message: 'user successfully added to friends',
            data: userFriends
        })

    }

    @Post('/send-notif')
    async sendNotif(@Req() req: RequestWithUser, @Res() res: Response) {
        const { id } = req.body
        const user = await this.userService.sendNotif(id)
        res.status(200).json({
            success: true,
            message: 'send notification',
        })

    }

}
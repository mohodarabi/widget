import { Controller, UseGuards, Post, Req, Get, Res, Patch, UseInterceptors, UploadedFiles, Param, Body, Delete, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import JwtAuthenticationGuard from 'src/authentication/accessToken/jwt-authentication.guard';
import RequestWithUser from 'src/authentication/interface/requestWithUser.interface';
import { WidgetService } from './widget.service';
import { multerOptions } from './uploadImage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateWidgetDtos } from './dtos/create-widget.dto';
import ContentType from './model/content-type.enum';

@Controller('widget-ios/widget')
export class WidgetController {

    constructor(private readonly widgetService: WidgetService) { }

    // ==================== WIDGETS ====================

    @Post('/create')
    @UseGuards(JwtAuthenticationGuard)
    async createWidget(@Body() body: CreateWidgetDtos, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.createWidget(body, user.id)
        res.status(200).json({
            success: true,
            message: 'widget created successfully',
            data: widget
        })
    }

    @Delete('/delete/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async deleteWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.deleteWidget(user.id, widgetId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    @Get('/home')
    @UseGuards(JwtAuthenticationGuard)
    async homeWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.homeWidget(user.id)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    @Get('/single/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async singleWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.singleWidget(user.id, widgetId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    // ==================== HISTORY ====================

    @Get('/history/app/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async getHistoryInApp(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.getHistoryInApp(user.id, widgetId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    @Get('/history/widget/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async getHistoryInWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.getHistoryInWidget(user.id, widgetId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    // ==================== MEMBERS ====================

    @Patch('/add-user/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async addUserToWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const { userId } = req.body
        const widget = await this.widgetService.addUserToWidget(user.id, widgetId, userId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    // ==================== REACTIONS ====================

    @Patch('/add-reaction/:widgetId/:contentId')
    @UseGuards(JwtAuthenticationGuard)
    async addReactionToWidget(@Param('widgetId') widgetId: string, @Param('contentId') contentId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const { type } = req.body
        const widget = await this.widgetService.addReactionToWidget(user.id, widgetId, contentId, type)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    @Patch('/show-reaction/:widgetId/:contentId')
    @UseGuards(JwtAuthenticationGuard)
    async showReactionToWidget(@Param('widgetId') widgetId: string, @Param('contentId') contentId: string, @Req() req: RequestWithUser, @Res() res: Response) {
        const { user } = req
        const widget = await this.widgetService.showReactionToWidget(user.id, widgetId, contentId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    // ==================== CONTENTS ====================

    @Post('/add-content/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    @UseInterceptors(FilesInterceptor('image', 1, multerOptions))
    async addContentWidget(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response, @UploadedFiles() image: Array<Express.Multer.File>) {
        const { user } = req
        const { type } = req.body
        if (!image || image.length === 0) throw new BadRequestException('You must upload image')
        const widget = await this.widgetService.addContentToWidget(user.id, widgetId, image[0].filename, type)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    @Post('/miss-you/:widgetId')
    @UseGuards(JwtAuthenticationGuard)
    async MissYou(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response, @UploadedFiles() image: Array<Express.Multer.File>) {
        const { user } = req
        const widget = await this.widgetService.MissYou(user.id, widgetId)
        res.status(200).json({
            success: true,
            message: 'widget history',
            data: widget
        })
    }

    // @Get('/single-users')
    // async sendMessageToSingles(@Param('widgetId') widgetId: string, @Req() req: RequestWithUser, @Res() res: Response, @UploadedFiles() image: Array<Express.Multer.File>) {
    //     const widget = await this.widgetService.sendMessageToSingles()
    //     res.status(200).json({
    //         success: true,
    //         message: 'widget history',
    //         data: widget
    //     })
    // }

}
import { IsString } from 'class-validator'

export class CreateWidgetDtos {
    @IsString()
    name: string

    @IsString()
    friendId?: string
}
import { IsString } from 'class-validator'

export class CreateUserDtos {
    @IsString()
    fullname: string

    @IsString()
    email: string;

    @IsString()
    password: string

    @IsString()
    confirmPassword: string
}
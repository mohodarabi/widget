import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'

export type UserDocument = mongoose.HydratedDocument<User>

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {

    @Prop({ default: null, type: String, unique: true })
    email: string

    @Prop({ default: null, type: String })
    password: string

    @Prop({ default: null, type: String })
    changedPassword: string

    @Prop({ required: true, type: String })
    username: string

    @Prop({ required: true, type: String })
    editedUsername: string

    @Prop({ required: true, type: String, unique: true })
    code: string

    @Prop({ default: false, type: Boolean })
    isVerified: boolean

    @Prop({ default: null, type: String })
    appleToken: string

    @Prop({ default: [], type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
    friends: string[]

    @Prop({ default: 0, type: Number })
    widgets: number

    @Prop({ required: true, type: String })
    profileImage: string

    @Prop({ default: null, type: String, unique: true })
    playerId: string

}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id
        delete ret['__v']
        delete ret['_id']
        delete ret['createdAt']
        delete ret['updatedAt']
        delete ret['appleToken']
        delete ret['editedUsername']
        // delete ret['email']
        delete ret['password']
        delete ret['friends']
        delete ret['playerId']
        delete ret['changedPassword']
        delete ret['widgets']
        ret.profileImage = `https://back.a2mp.site/widget-ios/userprofile/${ret.profileImage}`
        return ret
    },
})

UserSchema.set('toObject', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id.toString()
        return ret
    },
})
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { User } from 'src/users/model/user.schema'
import ReactionType from "./reaction-type.enum";
import RoleType from './role-type.enum';

export type ReactionDocument = mongoose.HydratedDocument<Reaction>

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Reaction {

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    sender: string

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Content' })
    contentId: string

    @Prop({ required: true, type: String, enum: ReactionType })
    type: ReactionType

    @Prop({ required: true, type: Date })
    createdAt: Date

}

export const ReactionSchema = SchemaFactory.createForClass(Reaction)

ReactionSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id
        delete ret['__v']
        delete ret['_id']
        delete ret['createdAt']
        return ret
    },
})

ReactionSchema.set('toObject', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id.toString()
        return ret
    },
})
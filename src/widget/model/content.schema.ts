import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { User } from 'src/users/model/user.schema'
import ContentType from './content-type.enum';
import * as moment from 'moment'

export type ContentDocument = mongoose.HydratedDocument<Content>

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Content {

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    sender: string

    @Prop({ required: true, type: String, enum: ContentType })
    type: ContentType

    @Prop({ required: true, type: String })
    data: string;

    @Prop({ default: 0, type: Number })
    reaction?: number;

    @Prop({ required: true, type: Date })
    createdAt: Date

}

export const ContentSchema = SchemaFactory.createForClass(Content)

ContentSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id
        ret.createdAt = moment(ret.createdAt).format('LT');
        delete ret['__v']
        delete ret['_id']
        delete ret['updatedAt']
        return ret
    },
})

ContentSchema.set('toObject', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id.toString()
        return ret
    },
})
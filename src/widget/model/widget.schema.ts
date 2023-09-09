import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import * as mongoose from 'mongoose'
import { User } from 'src/users/model/user.schema'
import { Reaction, ReactionSchema } from './reaction.schema'
import { Content, ContentSchema } from './content.schema'


export type WidgetDocument = mongoose.HydratedDocument<Widget>

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Widget {

    @Prop({ required: true, type: String })
    name: string

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    creator: string

    @Prop({ default: [], type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
    members: string[]

    @Prop({ required: true, type: Boolean })
    isAlone: boolean

    @Prop({ default: [], type: [ContentSchema] })
    contents: Content[]

    @Prop({ default: [], type: [ReactionSchema] })
    reactions: Reaction[]

}

export const WidgetSchema = SchemaFactory.createForClass(Widget)

WidgetSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id

        if (ret.contents.length === 0) {
            ret.contents = {}
        } else {
            ret.contents = ret.contents[ret.contents.length - 1]
        }

        delete ret['__v']
        delete ret['isAlone']
        delete ret['_id']
        delete ret['createdAt']
        delete ret['updatedAt']
        return ret
    },
})

WidgetSchema.set('toObject', {
    transform: function (doc, ret, opt) {
        ret.id = ret._id.toString()
        return ret
    },
})
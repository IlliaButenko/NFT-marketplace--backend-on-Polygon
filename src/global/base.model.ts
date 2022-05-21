import { modelOptions, prop, Severity } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

@modelOptions({
  options: { allowMixed: Severity.ALLOW },
  schemaOptions: {
    timestamps: true,
    toJSON: {
      virtuals: true,
      getters: true,
    },
  },
})
export abstract class BaseModel {
  @prop()
  createdAt: Date; // provided by schemaOptions.timestamps
  @prop()
  updatedAt: Date; // provided by schemaOptions.timestamps
  id: Schema.Types.ObjectId; // _id getter as string
}

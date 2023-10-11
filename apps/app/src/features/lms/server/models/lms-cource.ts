import mongoose, {
  Schema, type Model, type Document,
} from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import type { ILmsCource } from '../../interfaces';


const ObjectId = mongoose.Schema.Types.ObjectId;


export interface ILmsCourceDocument extends ILmsCource, Document {
}

export interface ILmsCourceModel extends Model<ILmsCourceDocument> {
  findByNamespace(namespace: string): Promise<ILmsCourceDocument>
}

const lmsCourceSchema = new Schema<ILmsCourceDocument, ILmsCource>({
  namespace: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  desc: { type: String },
  attendedUsers: [{ type: ObjectId, ref: 'User' }],
  attendedUserGroups: [{ type: ObjectId, ref: 'UserGroup' }],
});

lmsCourceSchema.statics.findByNamespace = async function(namespace: string): Promise<ILmsCourceDocument> {
  return this.findOne({ namespace }).lean();
};

export const LmsCource = getOrCreateModel<ILmsCourceDocument, ILmsCourceModel>('LmsCource', lmsCourceSchema);

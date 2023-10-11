import mongoose, {
  Schema, type Model, type Document,
} from 'mongoose';

import { getOrCreateModel } from '~/server/util/mongoose-utils';

import type { ILmsCource } from '../../interfaces';


const ObjectId = mongoose.Schema.Types.ObjectId;


export interface ILmsCourceDocument extends ILmsCource, Document {
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ILmsCourceModel extends Model<ILmsCourceDocument> {
}

const lmsCourceSchema = new Schema<ILmsCourceDocument, ILmsCource>({
  name: { type: String, required: true },
  desc: { type: String },
  attendedUsers: [{ type: ObjectId, ref: 'User' }],
  attendedUserGroups: [{ type: ObjectId, ref: 'UserGroup' }],
});

export const LmsCource = getOrCreateModel<ILmsCourceDocument, ILmsCourceModel>('LmsCource', lmsCourceSchema);

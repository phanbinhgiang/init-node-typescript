import mongoose, { Schema } from 'mongoose';
import { postStatus } from '../middleware/constants';

export const createSchema = (schema:object, key:string, options:object, indexOptions) => {
  const schemaModel = new Schema(
    schema,
    options ? Object.assign(options, { versionKey: false, timestamps: true })
      : { versionKey: false, timestamps: true },
  );
  if (indexOptions) {
    schemaModel.index(indexOptions.field, indexOptions.options);
  }

  return mongoose.model(key, schemaModel);
};

export const defaultModel = {
  date: { type: Date },
  string: { type: String, default: '' },
  numberUnique: { type: Number, required: true, unique: true },
  stringUnique: { type: String, required: true, unique: true },
  array: { type: Array, default: [] },
  number: { type: Number, default: 0 },
  boolean: { type: Boolean, default: true },
  booleanFalse: { type: Boolean, default: false },
  object: { type: Object, default: {} },
  stringStatus: { type: String, default: postStatus.waitingReview },
  stringContent: { type: Object, default: { gb: '', vn: '' } },
};

import mongoose, { Schema } from 'mongoose';

const categoryFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'select', 'number', 'boolean', 'textarea', 'multi-select'],
      required: true,
    },
    options: [{ type: String }],
    required: { type: Boolean, default: false },
    showAsBadge: { type: Boolean, default: false },
  },
  { _id: false }
);

const categorySchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String },
    fields: [categoryFieldSchema],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
       
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
       
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

categorySchema.index({ sortOrder: 1 });
categorySchema.index({ isActive: 1 });

export const CategoryModel =
  (mongoose.models.Category as mongoose.Model<typeof categorySchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Category', categorySchema);

import mongoose, { Schema } from 'mongoose';

const productSizeSchema = new Schema(
  {
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    breed: { type: String, required: true, trim: true },
    mainCategory: { type: String, required: true },
    careLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], required: true },
    humidity: { type: String },
    temperature: { type: String },
    feeding: { type: String },
    description: { type: String },
    images: [{ type: String }],
    featured: { type: Boolean, default: false },
    available: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
    sizes: [productSizeSchema],
    likes: { type: Number, default: 0 },

    // Generic category metadata
    customMeta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

productSchema.index({ mainCategory: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ available: 1, isVisible: 1 });

export const ProductModel =
  (mongoose.models.Product as mongoose.Model<typeof productSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Product', productSchema);

import mongoose, { Schema } from 'mongoose';

const cartItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    breed: { type: String },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    stock: { type: Number },
    size: { type: String },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
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

export const CartModel =
  (mongoose.models.Cart as mongoose.Model<typeof cartSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Cart', cartSchema);

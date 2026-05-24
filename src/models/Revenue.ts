import mongoose, { Schema } from 'mongoose';

const revenueSchema = new Schema(
  {
    _id: { type: String, required: true },
    sourceType: { type: String, enum: ['order'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, required: true },
    sourceCreatedAt: { type: Date, required: true },
    customerName: { type: String, default: 'Unknown' },
    customerEmail: { type: String, default: 'Unknown' },
    itemName: { type: String, default: 'Multiple Items' },
    orderId: { type: String, default: null },
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

revenueSchema.index({ status: 1 });
revenueSchema.index({ sourceType: 1 });
revenueSchema.index({ sourceCreatedAt: -1 });

export const RevenueModel =
  (mongoose.models.Revenue as mongoose.Model<typeof revenueSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Revenue', revenueSchema);

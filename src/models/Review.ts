import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema(
  {
    _id: { type: String, required: true },
    targetId: { type: String, required: true },
    targetType: { type: String, enum: ['product'], required: true },
    userId: { type: String, required: true },
    userName: { type: String },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
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

reviewSchema.index({ targetId: 1, targetType: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ status: 1 });

export const ReviewModel =
  (mongoose.models.Review as mongoose.Model<typeof reviewSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Review', reviewSchema);

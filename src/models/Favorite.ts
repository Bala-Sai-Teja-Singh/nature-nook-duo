import mongoose, { Schema } from 'mongoose';

const favoriteSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
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

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1 });

export const FavoriteModel =
  (mongoose.models.Favorite as mongoose.Model<typeof favoriteSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('Favorite', favoriteSchema);

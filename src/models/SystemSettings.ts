import mongoose, { Schema } from 'mongoose';

const upiIdSchema = new Schema(
  { id: String, label: String, value: String, isDefault: { type: Boolean, default: false } },
  { _id: false }
);

const shippingRuleSchema = new Schema(
  { id: String, minQuantity: Number, maxQuantity: Number, charge: Number },
  { _id: false }
);

const systemSettingsSchema = new Schema(
  {
    _id: { type: String, default: 'default' },
    upiIds: [upiIdSchema],
    bankDetails: { type: String },
    paymentInstructions: { type: String },
    emailNotifications: {
      orderConfirmations: { type: Boolean, default: true },
      paymentVerification: { type: Boolean, default: true },
    },
    storeStatus: {
      maintenanceMode: { type: Boolean, default: false },
    },
    shippingSettings: {
      rules: [shippingRuleSchema],
      disclaimer: { type: String },
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
       
      transform: (_doc: any, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
       
      transform: (_doc: any, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
    collection: 'system-settings',
  }
);

export const SystemSettingsModel =
  (mongoose.models.SystemSettings as mongoose.Model<typeof systemSettingsSchema extends Schema<infer T> ? T : never>) ||
  mongoose.model('SystemSettings', systemSettingsSchema);

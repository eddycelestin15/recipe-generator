import mongoose, { Schema, Model } from 'mongoose';
import { FridgeItem } from '../models';

const FridgeItemSchema = new Schema<FridgeItem>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['vegetables', 'fruits', 'dairy', 'meat', 'grains', 'condiments', 'other'],
      default: 'other',
    },
    expirationDate: {
      type: Date,
    },
    addedDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes
FridgeItemSchema.index({ userId: 1, expirationDate: 1 });
FridgeItemSchema.index({ userId: 1, category: 1 });

export const FridgeItemModel: Model<FridgeItem> =
  mongoose.models.FridgeItem || mongoose.model<FridgeItem>('FridgeItem', FridgeItemSchema);

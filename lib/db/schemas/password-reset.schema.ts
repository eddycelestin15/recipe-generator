import mongoose, { Schema, Model } from 'mongoose';

export interface IPasswordReset {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt?: Date;
}

const PasswordResetSchema = new Schema<IPasswordReset>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Create TTL index to automatically delete expired tokens
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetModel: Model<IPasswordReset> =
  (mongoose.models?.PasswordReset as Model<IPasswordReset>) ||
  mongoose.model<IPasswordReset>('PasswordReset', PasswordResetSchema);

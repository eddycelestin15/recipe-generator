import mongoose, { Schema, Model } from 'mongoose';

export interface IUsageLimits {
  userId: string;
  plan: 'free' | 'premium';

  // Monthly counters (reset on the 1st of each month)
  recipesGeneratedThisMonth: number;
  photoAnalysesThisMonth: number;
  aiChatMessagesThisMonth: number;

  // Absolute counters
  totalSavedRecipes: number;
  totalFridgeItems: number;
  totalHabits: number;
  totalRoutines: number;

  // Tracking
  lastResetDate: Date;
  updatedAt?: Date;
}

// Define the UsageLimits schema
const UsageLimitsSchema = new Schema<IUsageLimits>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'premium'],
      required: true,
      default: 'free',
    },
    recipesGeneratedThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    photoAnalysesThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    aiChatMessagesThisMonth: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSavedRecipes: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFridgeItems: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHabits: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRoutines: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastResetDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    toJSON: {
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Create indexes
UsageLimitsSchema.index({ userId: 1 }, { unique: true });

// Export the model
export const UsageLimitsModel: Model<IUsageLimits> =
  (mongoose.models?.UsageLimits as Model<IUsageLimits>) ||
  mongoose.model<IUsageLimits>('UsageLimits', UsageLimitsSchema);

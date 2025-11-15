import mongoose, { Schema, Model } from 'mongoose';
import { User, UserProfile, UserPreferences, UserGoals } from '../models';

// Define subdocument schemas
const UserProfileSchema = new Schema<UserProfile>(
  {
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    dietaryRestrictions: [{ type: String }],
    allergies: [{ type: String }],
  },
  { _id: false }
);

const UserPreferencesSchema = new Schema<UserPreferences>(
  {
    preferredCuisines: [{ type: String }],
    dislikedIngredients: [{ type: String }],
    cookingSkillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    maxCookingTime: { type: Number },
  },
  { _id: false }
);

const UserGoalsSchema = new Schema<UserGoals>(
  {
    targetWeight: { type: Number },
    dailyCalorieTarget: { type: Number },
    macroTargets: {
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
    },
    goalType: {
      type: String,
      enum: ['lose_weight', 'gain_weight', 'maintain', 'build_muscle'],
    },
  },
  { _id: false }
);

// Define the main User schema
const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profile: {
      type: UserProfileSchema,
      default: () => ({}),
    },
    preferences: {
      type: UserPreferencesSchema,
      default: () => ({}),
    },
    goals: {
      type: UserGoalsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
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
UserSchema.index({ email: 1 });

// Export the model
export const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>('User', UserSchema);

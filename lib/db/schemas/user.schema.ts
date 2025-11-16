import mongoose, { Schema, Model } from 'mongoose';
import { User, UserProfile, UserPreferences, UserGoals, UserSettings } from '../models';

// Define subdocument schemas
const UserProfileSchema = new Schema<UserProfile>(
  {
    age: { type: Number },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    height: { type: Number },
    weight: { type: Number },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    dietaryRestrictions: [{ type: String }],
    allergies: [{ type: String }],
    avatar: { type: String },
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
    dietType: {
      type: String,
      enum: ['none', 'vegan', 'vegetarian', 'keto', 'paleo', 'mediterranean', 'low_carb', 'gluten_free'],
    },
  },
  { _id: false }
);

const UserGoalsSchema = new Schema<UserGoals>(
  {
    targetWeight: { type: Number },
    targetDate: { type: Date },
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

const UserSettingsSchema = new Schema<UserSettings>(
  {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric',
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      email: { type: Boolean, default: true },
      mealReminders: { type: Boolean, default: false },
      expirationAlerts: { type: Boolean, default: true },
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
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    emailVerified: {
      type: Date,
    },
    image: {
      type: String,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
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
    settings: {
      type: UserSettingsSchema,
      default: () => ({
        units: 'metric',
        language: 'en',
        notifications: {
          email: true,
          mealReminders: false,
          expirationAlerts: true,
        },
      }),
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
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
// UserSchema.index({ email: 1 });

// Export the model
export const UserModel: Model<User> =
    (mongoose.models?.User as Model<User>) ||
    mongoose.model<User>('User', UserSchema);


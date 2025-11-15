import mongoose, { Schema, Model } from 'mongoose';
import { MealLog, CustomNutrition } from '../models';

const CustomNutritionSchema = new Schema<CustomNutrition>(
  {
    calories: { type: Number },
    protein: { type: Number },
    carbs: { type: Number },
    fat: { type: Number },
  },
  { _id: false }
);

const MealLogSchema = new Schema<MealLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      required: true,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    },
    recipeId: {
      type: String,
    },
    recipeName: {
      type: String,
    },
    servings: {
      type: Number,
      min: 0.1,
    },
    customNutrition: {
      type: CustomNutritionSchema,
    },
    notes: {
      type: String,
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

// Create compound index for efficient querying
MealLogSchema.index({ userId: 1, date: -1 });
MealLogSchema.index({ userId: 1, mealType: 1 });

export const MealLogModel: Model<MealLog> =
  mongoose.models.MealLog || mongoose.model<MealLog>('MealLog', MealLogSchema);

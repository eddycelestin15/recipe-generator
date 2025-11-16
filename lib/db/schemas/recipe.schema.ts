import mongoose, { Schema, Model } from 'mongoose';
import { Recipe, RecipeIngredient, NutritionInfo } from '../models';

const RecipeIngredientSchema = new Schema<RecipeIngredient>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
  },
  { _id: false }
);

const NutritionInfoSchema = new Schema<NutritionInfo>(
  {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number },
    sugar: { type: Number },
    sodium: { type: Number },
  },
  { _id: false }
);

const RecipeSchema = new Schema<Recipe>(
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
    description: {
      type: String,
      trim: true,
    },
    ingredients: {
      type: [RecipeIngredientSchema],
      required: true,
    },
    steps: {
      type: [String],
      required: true,
    },
    nutritionInfo: {
      type: NutritionInfoSchema,
    },
    tags: {
      type: [String],
      default: [],
    },
    cuisineType: {
      type: String,
    },
    servings: {
      type: Number,
      required: true,
      min: 1,
    },
    prepTime: {
      type: Number,
    },
    cookTime: {
      type: Number,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
    isFavorite: {
      type: Boolean,
      default: false,
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
RecipeSchema.index({ userId: 1, isFavorite: 1 });
RecipeSchema.index({ userId: 1, tags: 1 });
RecipeSchema.index({ name: 'text', description: 'text' });

export const RecipeModel: Model<Recipe> =
  mongoose.models.Recipe || mongoose.model<Recipe>('Recipe', RecipeSchema);

/**
 * Food Photo Analysis Repository
 *
 * Data access layer for food photo analyses using localStorage
 */

import type { FoodPhotoAnalysis, CreatePhotoAnalysisDTO, IdentifiedFood, TotalEstimated } from '../types/ai';

function generateId(): string {
  return `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

const STORAGE_KEY_PREFIX = 'food_photos_';

export class FoodPhotoRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getStorageKey(): string {
    return `${STORAGE_KEY_PREFIX}${this.getUserId()}`;
  }

  private static getAllPhotosFromStorage(): FoodPhotoAnalysis[] {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return [];

    try {
      const photos = JSON.parse(data);
      return photos.map((photo: any) => ({
        ...photo,
        analyzedDate: new Date(photo.analyzedDate),
      }));
    } catch (error) {
      console.error('Error parsing food photos from localStorage:', error);
      return [];
    }
  }

  private static savePhotosToStorage(photos: FoodPhotoAnalysis[]): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(photos));
  }

  /**
   * Create a new food photo analysis
   */
  static create(
    imageUrl: string,
    identifiedFoods: IdentifiedFood[],
    totalEstimated: TotalEstimated,
    overallAssessment: string
  ): FoodPhotoAnalysis {
    const photos = this.getAllPhotosFromStorage();

    const newPhoto: FoodPhotoAnalysis = {
      id: generateId(),
      userId: this.getUserId(),
      imageUrl,
      analyzedDate: new Date(),
      identifiedFoods,
      totalEstimated,
      overallAssessment,
      wasLoggedAsMeal: false,
    };

    photos.push(newPhoto);
    this.savePhotosToStorage(photos);

    return newPhoto;
  }

  /**
   * Get all food photo analyses
   */
  static getAll(): FoodPhotoAnalysis[] {
    return this.getAllPhotosFromStorage();
  }

  /**
   * Get food photo analysis by ID
   */
  static getById(id: string): FoodPhotoAnalysis | null {
    const photos = this.getAllPhotosFromStorage();
    return photos.find(photo => photo.id === id) || null;
  }

  /**
   * Get recent food photo analyses
   */
  static getRecent(limit: number = 20): FoodPhotoAnalysis[] {
    const photos = this.getAllPhotosFromStorage();
    return photos
      .sort((a, b) => b.analyzedDate.getTime() - a.analyzedDate.getTime())
      .slice(0, limit);
  }

  /**
   * Mark photo as logged as meal
   */
  static markAsLogged(id: string): FoodPhotoAnalysis | null {
    const photos = this.getAllPhotosFromStorage();
    const index = photos.findIndex(photo => photo.id === id);

    if (index === -1) return null;

    photos[index].wasLoggedAsMeal = true;
    this.savePhotosToStorage(photos);

    return photos[index];
  }

  /**
   * Get today's analysis count (for rate limiting)
   */
  static getTodayAnalysisCount(): number {
    const photos = this.getAllPhotosFromStorage();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return photos.filter(photo => {
      const photoDate = new Date(photo.analyzedDate);
      photoDate.setHours(0, 0, 0, 0);
      return photoDate.getTime() === today.getTime();
    }).length;
  }

  /**
   * Delete a food photo analysis
   */
  static delete(id: string): boolean {
    const photos = this.getAllPhotosFromStorage();
    const filteredPhotos = photos.filter(photo => photo.id !== id);

    if (filteredPhotos.length === photos.length) {
      return false;
    }

    this.savePhotosToStorage(filteredPhotos);
    return true;
  }

  /**
   * Clear all food photo analyses
   */
  static clearAll(): void {
    localStorage.removeItem(this.getStorageKey());
  }

  /**
   * Delete photos older than X days
   */
  static deleteOlderThan(days: number): number {
    const photos = this.getAllPhotosFromStorage();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredPhotos = photos.filter(
      photo => photo.analyzedDate >= cutoffDate
    );

    const deletedCount = photos.length - filteredPhotos.length;
    this.savePhotosToStorage(filteredPhotos);

    return deletedCount;
  }
}

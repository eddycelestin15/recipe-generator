/**
 * Progress Photo Repository
 *
 * Data access layer for progress photos using localStorage
 */

import type { ProgressPhoto, CreateProgressPhotoDTO, PhotoAngle } from '../types/health-dashboard';

const STORAGE_KEY = 'progress_photos';

export class ProgressPhotoRepository {
  private static getUserId(): string {
    let userId = localStorage.getItem('current_user_id');
    if (!userId) {
      userId = 'default_user';
      localStorage.setItem('current_user_id', userId);
    }
    return userId;
  }

  private static getAllPhotos(): ProgressPhoto[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    try {
      const photos = JSON.parse(data);
      return photos.map((p: any) => ({
        ...p,
        date: new Date(p.date),
        createdAt: new Date(p.createdAt),
      }));
    } catch (error) {
      console.error('Error parsing progress photos from localStorage:', error);
      return [];
    }
  }

  private static savePhotos(photos: ProgressPhoto[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }

  /**
   * Create new progress photo entry
   */
  static create(data: CreateProgressPhotoDTO): ProgressPhoto {
    const photos = this.getAllPhotos();
    const userId = this.getUserId();

    const newPhoto: ProgressPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      date: new Date(data.date),
      imageUrl: data.imageUrl,
      weight: data.weight,
      notes: data.notes,
      angle: data.angle,
      createdAt: new Date(),
    };

    photos.push(newPhoto);
    this.savePhotos(photos);
    return newPhoto;
  }

  /**
   * Get all photos for the current user
   */
  static getAll(): ProgressPhoto[] {
    const userId = this.getUserId();
    return this.getAllPhotos()
      .filter(p => p.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get photo by ID
   */
  static getById(id: string): ProgressPhoto | null {
    const photos = this.getAllPhotos();
    return photos.find(p => p.id === id) || null;
  }

  /**
   * Get photos by angle
   */
  static getByAngle(angle: PhotoAngle): ProgressPhoto[] {
    const userId = this.getUserId();
    return this.getAllPhotos()
      .filter(p => p.userId === userId && p.angle === angle)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get photos within a date range
   */
  static getByDateRange(startDate: Date, endDate: Date): ProgressPhoto[] {
    const userId = this.getUserId();
    return this.getAllPhotos()
      .filter(
        p =>
          p.userId === userId &&
          p.date >= startDate &&
          p.date <= endDate
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * Get the most recent photo for each angle
   */
  static getLatestByAngle(): Record<PhotoAngle, ProgressPhoto | null> {
    return {
      front: this.getByAngle('front')[0] || null,
      side: this.getByAngle('side')[0] || null,
      back: this.getByAngle('back')[0] || null,
    };
  }

  /**
   * Get before/after photos (first and latest for each angle)
   */
  static getBeforeAfter(): {
    angle: PhotoAngle;
    before: ProgressPhoto | null;
    after: ProgressPhoto | null;
  }[] {
    const angles: PhotoAngle[] = ['front', 'side', 'back'];

    return angles.map(angle => {
      const photos = this.getByAngle(angle);
      return {
        angle,
        before: photos.length > 0 ? photos[photos.length - 1] : null,
        after: photos.length > 0 ? photos[0] : null,
      };
    });
  }

  /**
   * Update photo
   */
  static update(
    id: string,
    data: Partial<Omit<CreateProgressPhotoDTO, 'imageUrl'>>
  ): ProgressPhoto | null {
    const photos = this.getAllPhotos();
    const index = photos.findIndex(p => p.id === id);

    if (index === -1) return null;

    const updated: ProgressPhoto = {
      ...photos[index],
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.angle !== undefined && { angle: data.angle }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
    };

    photos[index] = updated;
    this.savePhotos(photos);
    return updated;
  }

  /**
   * Delete photo
   */
  static delete(id: string): boolean {
    const photos = this.getAllPhotos();
    const filtered = photos.filter(p => p.id !== id);

    if (filtered.length === photos.length) return false;

    this.savePhotos(filtered);
    return true;
  }

  /**
   * Get timeline photos (evenly spaced photos over time)
   */
  static getTimeline(count: number = 6): ProgressPhoto[] {
    const photos = this.getAll();
    if (photos.length <= count) return photos;

    const interval = Math.floor(photos.length / count);
    const timeline: ProgressPhoto[] = [];

    for (let i = 0; i < count; i++) {
      const index = Math.min(i * interval, photos.length - 1);
      timeline.push(photos[photos.length - 1 - index]);
    }

    return timeline.reverse();
  }
}

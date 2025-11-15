/**
 * User Profile Repository
 *
 * Data access layer for user nutrition profiles using localStorage
 */

import type { UserProfile, CreateUserProfileDTO, UpdateUserProfileDTO } from '../types/nutrition';

const STORAGE_KEY_PREFIX = 'user_profile_';

export class UserProfileRepository {
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

  private static getProfileFromStorage(): UserProfile | null {
    const data = localStorage.getItem(this.getStorageKey());
    if (!data) return null;

    try {
      const profile = JSON.parse(data);
      return {
        ...profile,
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
      };
    } catch (error) {
      console.error('Error parsing user profile from localStorage:', error);
      return null;
    }
  }

  private static saveProfileToStorage(profile: UserProfile): void {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(profile));
  }

  /**
   * Get user profile
   */
  static get(): UserProfile | null {
    return this.getProfileFromStorage();
  }

  /**
   * Create user profile
   */
  static create(data: CreateUserProfileDTO): UserProfile {
    const profile: UserProfile = {
      userId: this.getUserId(),
      weight: data.weight,
      height: data.height,
      age: data.age,
      sex: data.sex,
      activityLevel: data.activityLevel,
      goalType: data.goalType,
      dietType: data.dietType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveProfileToStorage(profile);
    return profile;
  }

  /**
   * Update user profile
   */
  static update(data: UpdateUserProfileDTO): UserProfile | null {
    const profile = this.getProfileFromStorage();
    if (!profile) return null;

    const updatedProfile: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date(),
    };

    this.saveProfileToStorage(updatedProfile);
    return updatedProfile;
  }

  /**
   * Delete user profile
   */
  static delete(): boolean {
    const profile = this.getProfileFromStorage();
    if (!profile) return false;

    localStorage.removeItem(this.getStorageKey());
    return true;
  }

  /**
   * Check if profile exists
   */
  static exists(): boolean {
    return this.getProfileFromStorage() !== null;
  }
}

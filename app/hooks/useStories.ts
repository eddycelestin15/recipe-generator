'use client';

import { useState, useEffect } from 'react';
import { Story } from '../components/stories/StoriesCarousel';

// Demo stories data
const DEMO_STORIES: Story[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Chef Marie',
    userAvatar: undefined,
    imageUrl: undefined,
    isViewed: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'FoodLover',
    userAvatar: undefined,
    imageUrl: undefined,
    isViewed: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Jean Cuisine',
    userAvatar: undefined,
    imageUrl: undefined,
    isViewed: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Sophie',
    userAvatar: undefined,
    imageUrl: undefined,
    isViewed: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Marc Patissier',
    userAvatar: undefined,
    imageUrl: undefined,
    isViewed: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
  },
];

const STORAGE_KEY = 'recipe_stories';

export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load stories from localStorage or use demo data
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedStories = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const storiesWithDates = parsedStories.map((story: any) => ({
          ...story,
          timestamp: new Date(story.timestamp),
        }));
        setStories(storiesWithDates);
      } else {
        // First time, use demo data
        setStories(DEMO_STORIES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_STORIES));
      }
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories(DEMO_STORIES);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStories = (newStories: Story[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStories));
      setStories(newStories);
    } catch (error) {
      console.error('Error saving stories:', error);
    }
  };

  const markAsViewed = (storyId: string) => {
    const updatedStories = stories.map((story) =>
      story.id === storyId ? { ...story, isViewed: true } : story
    );
    saveStories(updatedStories);
  };

  const addStory = (story: Omit<Story, 'id' | 'timestamp'>) => {
    const newStory: Story = {
      ...story,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    const updatedStories = [newStory, ...stories];
    saveStories(updatedStories);
  };

  const refreshStories = async (): Promise<void> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        loadStories();
        resolve();
      }, 1000);
    });
  };

  return {
    stories,
    isLoading,
    markAsViewed,
    addStory,
    refreshStories,
  };
}

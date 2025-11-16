'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, User } from 'lucide-react';

export interface Story {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  imageUrl?: string;
  isViewed: boolean;
  timestamp: Date;
}

interface StoriesCarouselProps {
  stories?: Story[];
  onAddStory?: () => void;
  onViewStory?: (story: Story) => void;
}

export default function StoriesCarousel({
  stories = [],
  onAddStory,
  onViewStory,
}: StoriesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleStoryClick = (story: Story) => {
    if (!isDragging && onViewStory) {
      onViewStory(story);
    }
  };

  const handleAddStoryClick = () => {
    if (!isDragging && onAddStory) {
      onAddStory();
    }
  };

  return (
    <div className="w-full bg-card border-b border-border">
      <div className="max-w-lg mx-auto">
        <motion.div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide px-4 py-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onMouseDown={() => setIsDragging(false)}
          onMouseMove={() => setIsDragging(true)}
          onMouseUp={() => setTimeout(() => setIsDragging(false), 100)}
        >
          {/* Add Story Button */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 cursor-pointer"
            onClick={handleAddStoryClick}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 flex items-center justify-center relative">
                <User className="w-8 h-8 text-gray-400" />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-xs text-foreground-secondary truncate max-w-[64px]">
                Votre story
              </span>
            </div>
          </motion.div>

          {/* Story Items */}
          <AnimatePresence>
            {stories.map((story, index) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 cursor-pointer"
                onClick={() => handleStoryClick(story)}
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-16 h-16 rounded-full p-0.5 ${
                      story.isViewed
                        ? 'bg-gray-300'
                        : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                    }`}
                  >
                    <div className="w-full h-full rounded-full bg-card p-0.5">
                      {story.userAvatar ? (
                        <img
                          src={story.userAvatar}
                          alt={story.userName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs truncate max-w-[64px] ${
                      story.isViewed ? 'text-foreground-tertiary' : 'text-foreground-secondary font-medium'
                    }`}
                  >
                    {story.userName}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

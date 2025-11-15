'use client';

import { Droplet, Plus, Minus } from 'lucide-react';

interface WaterIntakeProps {
  currentIntake: number; // in ml
  onUpdate: (newIntake: number) => void;
  goal?: number; // goal in ml (default 2000ml)
}

export function WaterIntake({ currentIntake, onUpdate, goal = 2000 }: WaterIntakeProps) {
  const glassSize = 250; // ml per glass
  const glasses = Math.round(currentIntake / glassSize);
  const goalGlasses = Math.round(goal / glassSize);

  const addGlass = () => {
    onUpdate(currentIntake + glassSize);
  };

  const removeGlass = () => {
    onUpdate(Math.max(0, currentIntake - glassSize));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Droplet className="w-5 h-5 text-blue-500" />
          <span>Hydratation</span>
        </h3>
        <span className="text-sm text-gray-500">
          {currentIntake}ml / {goal}ml
        </span>
      </div>

      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={removeGlass}
          disabled={currentIntake === 0}
          className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <Minus className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex space-x-1 mb-2">
            {Array.from({ length: goalGlasses }).map((_, i) => (
              <Droplet
                key={i}
                className={`w-6 h-6 ${
                  i < glasses ? 'text-blue-500 fill-blue-500' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-2xl font-bold">
            {glasses} / {goalGlasses}
          </span>
          <span className="text-sm text-gray-500">verres</span>
        </div>

        <button
          onClick={addGlass}
          className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min((currentIntake / goal) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface MacroCircleProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  color: string;
}

export default function MacroCircle({
  label,
  current,
  goal,
  unit = 'g',
  color,
}: MacroCircleProps) {
  const percentage = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;

  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 mb-3">
        <CircularProgressbar
          value={percentage}
          text={`${Math.round(percentage)}%`}
          styles={buildStyles({
            textSize: '20px',
            pathColor: color,
            textColor: '#1f2937',
            trailColor: '#e5e7eb',
          })}
        />
      </div>
      <h3 className="font-semibold text-gray-900">{label}</h3>
      <p className="text-sm text-gray-600 mt-1">
        {Math.round(current)}/{Math.round(goal)}{unit}
      </p>
    </div>
  );
}

'use client';

import { AlertCircle, Lightbulb, Trophy, Info, X, ExternalLink } from 'lucide-react';
import type { AIInsight } from '../lib/types/ai';
import { INSIGHT_PRIORITY_COLORS } from '../lib/types/ai';

interface InsightCardProps {
  insight: AIInsight;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function InsightCard({ insight, onMarkAsRead, onDelete }: InsightCardProps) {
  const getIcon = () => {
    switch (insight.type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      case 'tip':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeLabel = () => {
    switch (insight.type) {
      case 'alert':
        return 'Alerte';
      case 'suggestion':
        return 'Suggestion';
      case 'achievement':
        return 'Succès';
      case 'tip':
        return 'Conseil';
      default:
        return 'Info';
    }
  };

  const getTypeColor = () => {
    switch (insight.type) {
      case 'alert':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'suggestion':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'achievement':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'tip':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleMarkAsRead = async () => {
    if (onMarkAsRead && !insight.read) {
      try {
        await fetch(`/api/ai/insights/${insight.id}/read`, {
          method: 'POST',
        });
        onMarkAsRead(insight.id);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      try {
        await fetch(`/api/ai/insights/${insight.id}`, {
          method: 'DELETE',
        });
        onDelete(insight.id);
      } catch (error) {
        console.error('Error deleting insight:', error);
      }
    }
  };

  return (
    <div
      className={`border-l-4 rounded-lg p-4 ${getTypeColor()} ${
        !insight.read ? 'shadow-md' : 'opacity-75'
      } transition-all hover:shadow-lg`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
                {getTypeLabel()}
              </span>
              {!insight.read && (
                <span className="w-2 h-2 bg-current rounded-full animate-pulse" />
              )}
            </div>
            <div className="flex gap-1">
              {!insight.read && onMarkAsRead && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-xs opacity-75 hover:opacity-100 underline"
                  title="Marquer comme lu"
                >
                  Marquer lu
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-gray-800 mb-1">{insight.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{insight.message}</p>

          <div className="flex items-center justify-between">
            <p className="text-xs opacity-75">
              {new Date(insight.createdDate).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {insight.actionable && insight.actionLink && (
              <a
                href={insight.actionLink}
                className="text-xs font-medium flex items-center gap-1 hover:underline"
              >
                {insight.actionable}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Priority indicator */}
      {insight.priority === 'high' && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <p className="text-xs font-semibold uppercase tracking-wide">
            Priorité élevée
          </p>
        </div>
      )}
    </div>
  );
}

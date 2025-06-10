import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { CanvasSettingsFormProps } from '../lib/types';

export const CanvasSettingsForm: React.FC<CanvasSettingsFormProps> = ({
  canvasBgColor,
  canvasFgColor,
  roundedCorners,
  showGrid,
  isEditing,
  onSubmit,
  onCancel,
  onBgColorChange,
  onFgColorChange,
  onToggleRoundedCorners,
  onToggleShowGrid,
  onWidthChange,
  onHeightChange,
  newCanvasWidth,
  newCanvasHeight,
}) => {
  const { theme } = useTheme();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const width = parseInt(newCanvasWidth);
      const height = parseInt(newCanvasHeight);
      onSubmit(width, height);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isEditing) return null;

  return (
    <div className="absolute top-4 right-4 z-30 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border dark:border-gray-700">
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={newCanvasWidth}
            onChange={(e) => onWidthChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-16 h-8 text-sm font-mono rounded px-2 ${
              theme === 'dark'
                ? 'bg-gray-600 text-white border-gray-500'
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
            min="200"
            max="1200"
            aria-label="Canvas Width"
          />
          <span
            className={`text-sm font-mono ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            ×
          </span>
          <input
            type="number"
            value={newCanvasHeight}
            onChange={(e) => onHeightChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-16 h-8 text-sm font-mono rounded px-2 ${
              theme === 'dark'
                ? 'bg-gray-600 text-white border-gray-500'
                : 'bg-white text-gray-900 border-gray-300'
            } border`}
            min="200"
            max="1200"
            aria-label="Canvas Height"
          />
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label
              className={`text-xs font-mono ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Background
            </label>
            <input
              type="color"
              value={canvasBgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              aria-label="Background Color"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className={`text-xs font-mono ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Foreground
            </label>
            <input
              type="color"
              value={canvasFgColor}
              onChange={(e) => onFgColorChange(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
              aria-label="Foreground Color"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label
            className={`text-xs font-mono ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Rounded Corners
          </label>
          <button
            onClick={onToggleRoundedCorners}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              roundedCorners
                ? theme === 'dark'
                  ? 'bg-blue-600'
                  : 'bg-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            }`}
            aria-label={`Toggle Rounded Corners ${roundedCorners ? 'off' : 'on'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                roundedCorners ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label
            className={`text-xs font-mono ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Show Grid
          </label>
          <button
            onClick={onToggleShowGrid}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showGrid
                ? theme === 'dark'
                  ? 'bg-blue-600'
                  : 'bg-blue-500'
                : theme === 'dark'
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            }`}
            aria-label={`Toggle Grid ${showGrid ? 'off' : 'on'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showGrid ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

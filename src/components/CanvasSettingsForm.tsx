import React, { useState } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { CanvasSettingsFormProps } from '../lib/types';
import ColorPicker from 'react-best-gradient-color-picker';
import { Palette, X, Grid, Monitor, Square, RectangleHorizontal, RectangleVertical } from 'lucide-react';

export const CanvasSettingsForm: React.FC<CanvasSettingsFormProps> = ({
  canvasBgColor,
  // canvasFgColor,
  roundedCorners,
  showGrid,
  isEditing,
  onSubmit,
  onCancel,
  onBgColorChange,
  // onFgColorChange,
  onToggleRoundedCorners,
  onToggleShowGrid,
  onWidthChange,
  onHeightChange,
  newCanvasWidth,
  newCanvasHeight,
}) => {
  const { theme } = useTheme();
  const [toggleColorPanel, setToggleColorPanel] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'A4' | 'A3' | '2K' | '16:9' | '1:1' | '3:4' | 'Custom'>('Custom');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');


  const predefinedSizes = {
    'A4': { width: 595, height: 842 },
    'A3': { width: 842, height: 1191 },
    '2K': { width: 2048, height: 1080 },
    '16:9': { width: 1920, height: 1080 },
    '1:1': { width: 1080, height: 1080 },
    '3:4': { width: 810, height: 1080 },
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const width = parseInt(newCanvasWidth);
      const height = parseInt(newCanvasHeight);
      onSubmit(width, height);
      setOrientation(height > width ? 'portrait' : 'landscape')
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handlePresetSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as keyof typeof predefinedSizes;
    setSelectedSize(value);
    const { width, height } = predefinedSizes[value];
    setOrientation(height > width ? 'portrait' : 'landscape')
    onSubmit(width, height);
  };

  const handleWidthChange = (value: string) => {
    setSelectedSize('Custom');
    onWidthChange(value);
    const width = parseInt(value);
    const height = parseInt(newCanvasHeight);
    if (!isNaN(width) && !isNaN(height)) {
      onSubmit(width, height);
      setOrientation(height > width ? 'portrait' : 'landscape');
    }
  };

  const handleHeightChange = (value: string) => {
    setSelectedSize('Custom');
    onHeightChange(value);
    const width = parseInt(newCanvasWidth);
    const height = parseInt(value);
    if (!isNaN(width) && !isNaN(height)) {
      onSubmit(width, height);
      setOrientation(height > width ? 'portrait' : 'landscape');
    }
  };



  const handleOrientationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget;
    const selectedOrientation = target.getAttribute('data-orientation') as 'portrait' | 'landscape';

    if (!selectedOrientation || selectedOrientation === orientation) return;

    setOrientation(selectedOrientation);

    const width = parseInt(newCanvasWidth);
    const height = parseInt(newCanvasHeight);
    onWidthChange(height.toString());
    onHeightChange(width.toString());
    onSubmit(height, width);
  };

  if (!isEditing) return null;

  return (
    <>
      <div className="absolute left-4 top-[250px] z-30 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border dark:border-gray-700 w-80 transition-all duration-300 ease-in-out">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Canvas Settings</h3>
            <button
              onClick={onCancel}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close settings"
            >
              <X size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Monitor size={16} /> Canvas Size
            </label>
            <div className="flex w-full gap-2 items-center">
              <input
                type="number"
                value={newCanvasWidth}
                onChange={(e) => handleWidthChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-20 flex-1 h-9 text-sm font-mono rounded-lg px-3 py-1 transition-all duration-200 ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-400'
                  } border focus:ring-2 focus:outline-none`}
                min="200"
                max="1280"
                aria-label="Canvas Width"
                placeholder="Width"
              />
              <span className="text-3xl font-mono text-gray-500">×</span>
              <input
                type="number"
                value={newCanvasHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`flex-1 w-20 h-9 text-sm font-mono rounded-lg px-3 py-1 transition-all duration-200 ${theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-400'
                  } border focus:ring-2 focus:outline-none`}
                min="200"
                max="1280"
                aria-label="Canvas Height"
                placeholder="Height"
              />
            </div>
            <select
              value={selectedSize}
              onChange={handlePresetSizeChange}
              className={`w-full  h-9 text-sm font-mono rounded-lg px-3 py-1 transition-all duration-200 ${theme === 'dark'
                ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500'
                : 'bg-gray-50 text-gray-900 border-gray-300 focus:ring-blue-400'
                } border focus:ring-2 focus:outline-none`}
            >
              <option value="Custom">Custom</option>
              {Object.entries(predefinedSizes).map(([key, { width, height }]) => (
                <option key={key} value={key}>
                  {key} ({width} × {height})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between mt-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              Orientation
            </label>
            <div className="flex gap-2">
              <button
                data-orientation="portrait"
                onClick={handleOrientationClick}
                aria-label="Set Portrait Orientation"
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${orientation === 'portrait'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                <RectangleVertical size={18} />
              </button>

              <button
                data-orientation="landscape"
                onClick={handleOrientationClick}
                aria-label="Set Landscape Orientation"
                className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${orientation === 'landscape'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300'
                  }`}
              >
                <RectangleHorizontal size={18} />
              </button>
            </div>
          </div>


          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Palette size={16} /> Background Color
            </label>
            <div
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => setToggleColorPanel(!toggleColorPanel)}
            >
              <div
                style={{ background: canvasBgColor }}
                className="w-full h-8 rounded-md border border-gray-300 dark:border-gray-600 transition-transform group-hover:scale-105"
              />
              <span className="text-sm font-mono text-gray-500">{canvasBgColor}</span>
            </div>
          </div>


          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Square size={16} /> Rounded Corners
              </label>
              <button
                onClick={onToggleRoundedCorners}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${roundedCorners
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
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${roundedCorners ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Grid size={16} /> Show Grid
              </label>
              <button
                onClick={onToggleShowGrid}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${showGrid
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
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${showGrid ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`absolute rounded-lg bg-gray-800 top-[330px] left-10 z-30 transition-all duration-300 ${toggleColorPanel ? 'p-3 opacity-100' : 'h-0 p-0 opacity-0'
          } overflow-hidden shadow-xl border dark:border-gray-700`}
      >
        <ColorPicker
          value={canvasBgColor}
          onChange={onBgColorChange}
          className="rounded"
          height={170}
          aria-label="Background Color or Gradient"
          hidePresets={true}
          hideAdvancedSliders={true}
        />
      </div>
    </>
  );
};
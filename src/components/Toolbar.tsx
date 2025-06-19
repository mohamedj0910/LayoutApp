import React, { useState, useEffect, useRef } from 'react';
import { Plus, Square, Circle, Triangle, Star, Diamond, Slash, Type, Trash2, Settings, Download, Upload, Save, Sun, Moon } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { ToolbarProps } from '../lib/types';

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddRectangle,
  onAddCircle,
  onAddTriangle,
  onAddStar,
  onAddDiamond,
  onAddLine,
  onAddText,
  onClearPanels,
  onToggleCanvasSettings,
  onExportToPNG,
  onExportConfig,
  onImportConfig,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        addButtonRef.current &&
        !addButtonRef.current.contains(event.target as Node)
      ) {
        setIsShapeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shapeButtons = [
    {
      icon: <Square size={20} />,
      label: 'Rectangle',
      onClick: () => {
        onAddRectangle();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Circle size={20} />,
      label: 'Circle',
      onClick: () => {
        onAddCircle();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      icon: <Triangle size={20} />,
      label: 'Triangle',
      onClick: () => {
        onAddTriangle();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <Star size={20} />,
      label: 'Star',
      onClick: () => {
        onAddStar();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
      icon: <Diamond size={20} />,
      label: 'Diamond',
      onClick: () => {
        onAddDiamond();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: <Slash size={20} />,
      label: 'Line',
      onClick: () => {
        onAddLine();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600',
    },
    {
      icon: <Type size={20} />,
      label: 'Text',
      onClick: () => {
        onAddText();
        setIsShapeMenuOpen(false);
      },
      color: theme === 'dark' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600',
    },
  ];

  return (
    <div className="flex z-50">
      <div className="fixed left-0 top-0 h-screen w-16 bg-gray-100 dark:bg-gray-800 flex flex-col items-center py-4 space-y-4">
        <div className="relative">
          <button
            ref={addButtonRef}
            onClick={() => setIsShapeMenuOpen((prev) => !prev)}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-500 hover:bg-teal-600'} text-white cursor-pointer`}
            aria-label="Toggle Shape Menu"
          >
            <Plus size={20} />
          </button>
          {isShapeMenuOpen && (
            <div
              ref={menuRef}
              className="absolute left-full top-0 ml-2 w-32 flex flex-col space-y-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg z-40"
            >
              {shapeButtons.map((btn, index) => (
                <button
                  key={index}
                  onClick={btn.onClick}
                  className={`w-full p-2 rounded-lg ${btn.color} text-white cursor-pointer flex items-center space-x-2`}
                  aria-label={`Add ${btn.label}`}
                >
                  {btn.icon}
                  <span className="text-xs font-medium text-white">{btn.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={onClearPanels}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white cursor-pointer`}
            aria-label="Clear Panels"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className="relative">
          <button
            onClick={onExportConfig}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white cursor-pointer`}
            aria-label="Save Configuration"
          >
            <Save size={20} />
          </button>
        </div>
        <div className="relative">
          <label
            htmlFor="upload-config"
            className={`p-2 rounded-lg inline-flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white cursor-pointer`}
            aria-label="Upload Configuration"
          >
            <Upload size={20} />
            <input
              id="upload-config"
              type="file"
              accept=".json"
              onChange={onImportConfig}
              className="hidden"
              aria-label="Upload Configuration"
            />
          </label>
        </div>
        <div className="relative">
          <button
            onClick={onExportToPNG}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white cursor-pointer`}
            aria-label="Export to PNG"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="relative">
          <button
            onClick={onToggleCanvasSettings}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-500 hover:bg-gray-600'} text-white cursor-pointer`}
            aria-label="Toggle Canvas Settings"
          >
            <Settings size={20} />
          </button>
        </div>
        <div className="relative">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'} text-white cursor-pointer`}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};
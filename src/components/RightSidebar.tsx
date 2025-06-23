import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Paintbrush,
  Type,
  Layers,
  ChevronDown,
  ChevronUp,
  Lock,
  Unlock,
  Link,
  Unlink,
  Square,
} from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { RightSidebarProps, PanelStyles, TitleStyle } from '../lib/types';

export const RightSidebar: React.FC<RightSidebarProps> = ({
  panel,
  panels,
  isOpen,
  onClose,
  onPanelStylesChange,
  onTitleStyleChange,
  onZIndexChange,
  onTitleChange,
  onPanelDimensionsChange,
}) => {
  const { theme } = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    panelStyles: true,
    sizeAndPosition: true,
    titleStyles: true,
    layering: true,
  });
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(false);

  useEffect(() => {
    if (panel) {
      setExpandedSections({
        panelStyles: true,
        sizeAndPosition: true,
        titleStyles: true,
        layering: true,
      });
    }
  }, [panel?.id]);

  if (!isOpen || !panel) return null;

  const themeStyles = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-800',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    inputBackground: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    inputBorder: theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
    sectionHeader: theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50',
    sectionHeaderHover: theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    buttonSecondary: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300',
    buttonSecondaryText: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
    layerButton: theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200',
    divider: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    icon: theme === 'dark' ? 'text-blue-400' : 'text-blue-500',
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleTitleInput = (value: string) => {
    onTitleChange(panel.id, value);
  };

  const handlePanelStyleChange = (key: keyof PanelStyles, value: any) => {
    onPanelStylesChange(panel.id, { ...panel.panelStyles, [key]: value });
  };

  const handleTitleStyleChange = (key: keyof TitleStyle, value: any) => {
    onTitleStyleChange(panel.id, { ...panel.titleStyle, [key]: value });
  };

  const handleDimensionChange = (
    key: 'width' | 'height' | 'x' | 'y',
    value: number,
    originalDimensions: { width: number; height: number }
  ) => {
    const minWidth = panel.shapeType === 'text' ? 100 : 100;
    const minHeight = panel.shapeType === 'text' ? 50 : 100;
    let newDimensions: { width?: number; height?: number; x?: number; y?: number } = { [key]: value };

    if (isAspectRatioLocked && (key === 'width' || key === 'height')) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      if (key === 'width') {
        newDimensions.height = Math.max(minHeight, value / aspectRatio);
      } else if (key === 'height') {
        newDimensions.width = Math.max(minWidth, value * aspectRatio);
      }
    }

    // Enforce minimum constraints
    if (newDimensions.width !== undefined) {
      newDimensions.width = Math.max(minWidth, newDimensions.width);
    }
    if (newDimensions.height !== undefined) {
      newDimensions.height = Math.max(minHeight, newDimensions.height);
    }
    if (newDimensions.x !== undefined) {
      newDimensions.x = Math.max(0, newDimensions.x);
    }
    if (newDimensions.y !== undefined) {
      newDimensions.y = Math.max(0, newDimensions.y);
    }

    onPanelDimensionsChange(panel.id, newDimensions);
  };

  const currentIndex = panels
    .sort((a, b) => a.zIndex - b.zIndex)
    .findIndex((p) => p.id === panel.id);

  const handleZIndexAction = (action: 'back' | 'forward' | 'toBack' | 'toFront') => {
    if (
      (action === 'back' && currentIndex === 0) ||
      (action === 'forward' && currentIndex === panels.length - 1) ||
      (action === 'toBack' && currentIndex === 0) ||
      (action === 'toFront' && currentIndex === panels.length - 1)
    ) {
      return;
    }
    onZIndexChange(panel.id, action);
  };




  return (

    <div
      className={`fixed right-0 top-0 h-screen w-80 ${themeStyles.background} p-4 shadow-2xl border-l ${themeStyles.border} z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Header */}
      <div className={`flex justify-between items-center mb-4 pb-4 border-b ${themeStyles.divider}`}>
        <h2 className={`text-lg font-semibold ${themeStyles.text}`}>
          Panel Properties
        </h2>
        <button
          onClick={onClose}
          className={`p-1.5 rounded-md ${themeStyles.sectionHeaderHover} ${themeStyles.buttonSecondaryText} transition-colors`}
          aria-label="Close Sidebar"
        >
          <X size={18} className={themeStyles.text} />
        </button>
      </div>



      <div className={`space-y-3 overflow-y-auto h-[calc(100vh-100px)] pr-2 ${themeStyles.text}`}>
        {/* Panel Styles Section */}
        <div className={`border rounded-lg overflow-hidden ${themeStyles.border}`}>
          <button
            onClick={() => toggleSection('panelStyles')}
            className={`w-full flex items-center justify-between p-3 text-left ${themeStyles.sectionHeader} ${themeStyles.sectionHeaderHover} transition-colors`}
            aria-expanded={expandedSections.panelStyles}
            aria-controls="panel-styles-content"
          >
            <div className="flex items-center gap-2">
              <Paintbrush size={16} className={themeStyles.icon} />
              <span className="font-medium text-sm">Panel Styles</span>
            </div>
            {expandedSections.panelStyles ? (
              <ChevronUp size={16} className={themeStyles.text} />
            ) : (
              <ChevronDown size={16} className={themeStyles.text} />
            )}
          </button>
          <div
            id="panel-styles-content"
            className={`transition-all duration-300 ease-in-out ${expandedSections.panelStyles ? 'p-2 max-h-[600px]' : 'px-2 py-0 max-h-0'} overflow-hidden`}
          >
            <div className="space-y-4">
              {/* Background Color */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    disabled={panel.panelStyles?.locked}
                    value={panel.panelStyles?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handlePanelStyleChange('backgroundColor', e.target.value)}
                    className={`w-10 h-9 rounded cursor-pointer border ${themeStyles.inputBorder}`}
                    aria-label="Panel Background Color"
                  />
                  <input
                    type="text"
                    disabled={panel.panelStyles?.locked}
                    value={panel.panelStyles?.backgroundColor || '#FFFFFF'}
                    onChange={(e) => handlePanelStyleChange('backgroundColor', e.target.value)}
                    className={`flex-1 h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel Background Color Text"
                  />
                  <button
                    disabled={panel.panelStyles?.locked}
                    onClick={() => handlePanelStyleChange('backgroundColor', null)}
                    className={`px-2.5 rounded ${themeStyles.buttonSecondary} ${themeStyles.buttonSecondaryText} transition-colors`}
                    aria-label="Clear Background Color"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Border Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Border Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      disabled={panel.panelStyles?.locked}
                      value={panel.panelStyles?.borderColor || '#D1D5DB'}
                      onChange={(e) => handlePanelStyleChange('borderColor', e.target.value)}
                      className={`w-10 h-9 rounded cursor-pointer border ${themeStyles.inputBorder}`}
                      aria-label="Panel Border Color"
                    />
                    <button
                      disabled={panel.panelStyles?.locked}
                      onClick={() => handlePanelStyleChange('borderColor', null)}
                      className={`px-2.5 rounded ${themeStyles.buttonSecondary} ${themeStyles.buttonSecondaryText} transition-colors`}
                      aria-label="Clear Border Color"
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Border Style
                  </label>
                  <select
                    value={panel.panelStyles?.borderStyle || 'solid'}
                    disabled={panel.panelStyles?.locked}
                    onChange={(e) =>
                      handlePanelStyleChange('borderStyle', e.target.value as 'solid' | 'dashed' | 'dotted')
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel Border Style"
                  >
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                  </select>
                </div>
              </div>

              {/* Border Width */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Border Width: {panel.panelStyles?.borderWidth || 0}px
                </label>
                <input
                  type="range"
                  disabled={panel.panelStyles?.locked}
                  min="0"
                  max="10"
                  step="0.5"
                  value={panel.panelStyles?.borderWidth || 0}
                  onChange={(e) => handlePanelStyleChange('borderWidth', parseFloat(e.target.value))}
                  className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-500`}
                  aria-label="Panel Border Width"
                />
              </div>

              {/* Rotation */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Rotation: {panel.panelStyles?.rotate || 0}°
                </label>
                <input
                  type="range"
                  disabled={panel.panelStyles?.locked}
                  min="0"
                  max="360"
                  step="1"
                  value={panel.panelStyles?.rotate || 0}
                  onChange={(e) => handlePanelStyleChange('rotate', parseInt(e.target.value))}
                  className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-500`}
                  aria-label="Panel Rotation"
                />
              </div>

              {/* Opacity */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Opacity: {Math.round((panel.panelStyles?.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  disabled={panel.panelStyles?.locked}
                  min="0"
                  max="1"
                  step="0.01"
                  value={panel.panelStyles?.opacity || 1}
                  onChange={(e) => handlePanelStyleChange('opacity', parseFloat(e.target.value))}
                  className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-500`}
                  aria-label="Panel Opacity"
                />
              </div>

              {/* Lock Toggle */}
              <div className="flex items-center justify-between pt-2">
                <label

                  onClick={() => handlePanelStyleChange('locked', !panel.panelStyles?.locked)}
                  className={`flex items-center gap-2 text-sm ${themeStyles.text}`}>
                  {panel.panelStyles?.locked ? <Lock className='text-blue-400' size={15} /> : <Unlock size={15} />} <span>Lock Panel</span>
                </label >
                <button
                  onClick={() => handlePanelStyleChange('locked', !panel.panelStyles?.locked)}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 ${panel.panelStyles?.locked
                    ? 'bg-blue-500'
                    : theme === 'dark'
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                    }`}
                  aria-label={`Toggle Locked ${panel.panelStyles?.locked ? 'off' : 'on'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow ${panel.panelStyles?.locked ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Size and Position Section */}
        <div className={`border rounded-lg overflow-hidden ${themeStyles.border}`}>
          <button
            onClick={() => toggleSection('sizeAndPosition')}
            className={`w-full flex items-center justify-between p-3 text-left ${themeStyles.sectionHeader} ${themeStyles.sectionHeaderHover} transition-colors`}
            aria-expanded={expandedSections.sizeAndPosition}
            aria-controls="size-and-position-content"
          >
            <div className="flex items-center gap-2">
              <Square size={16} className={themeStyles.icon} />
              <span className="font-medium text-sm">Size and Position</span>
            </div>
            {expandedSections.sizeAndPosition ? (
              <ChevronUp size={16} className={themeStyles.text} />
            ) : (
              <ChevronDown size={16} className={themeStyles.text} />
            )}
          </button>
          <div
            id="size-and-position-content"
            className={`transition-all duration-300 ease-in-out ${expandedSections.sizeAndPosition ? 'p-2 max-h-[200px]' : 'px-2 py-0 max-h-0'} overflow-hidden`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 items-center">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Width
                  </label>
                  <input
                    type="number"
                    disabled={panel.panelStyles?.locked}
                    min={panel.shapeType === 'text' ? 100 : 100}
                    max="2000"
                    step="1"
                    value={Math.round(panel.width)}
                    onChange={(e) =>
                      handleDimensionChange('width', parseInt(e.target.value), { width: panel.width, height: panel.height })
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel Width"
                  />
                </div>
                <div className="flex items-center justify-center h-full">
                  <button
                    disabled={panel.panelStyles?.locked}
                    onClick={() => setIsAspectRatioLocked(!isAspectRatioLocked)}
                    className={`p-1 mt-5 rounded ${themeStyles.buttonSecondary} ${themeStyles.buttonSecondaryText} transition-colors`}
                    aria-label={isAspectRatioLocked ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                  >
                    {isAspectRatioLocked ? <Unlink size={16} className={themeStyles.icon} /> : <Link size={16} className={themeStyles.icon} />}
                  </button>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Height
                  </label>
                  <input
                    type="number"
                    disabled={panel.panelStyles?.locked}
                    min={panel.shapeType === 'text' ? 50 : 100}
                    max="2000"
                    step="1"
                    value={Math.round(panel.height)}
                    onChange={(e) =>
                      handleDimensionChange('height', parseInt(e.target.value), { width: panel.width, height: panel.height })
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel Height"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    X Position
                  </label>
                  <input
                    type="number"
                    disabled={panel.panelStyles?.locked}
                    min="0"
                    max="2000"
                    step="1"
                    value={Math.round(panel.x)}
                    onChange={(e) => handleDimensionChange('x', parseInt(e.target.value), { width: panel.width, height: panel.height })}
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel X Position"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Y Position
                  </label>
                  <input
                    type="number"
                    disabled={panel.panelStyles?.locked}
                    min="0"
                    max="2000"
                    step="1"
                    value={Math.round(panel.y)}
                    onChange={(e) => handleDimensionChange('y', parseInt(e.target.value), { width: panel.width, height: panel.height })}
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Panel Y Position"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title Styles Section */}
        <div className={`border rounded-lg overflow-hidden ${themeStyles.border}`}>
          <button
            onClick={() => toggleSection('titleStyles')}
            className={`w-full flex items-center justify-between p-3 text-left ${themeStyles.sectionHeader} ${themeStyles.sectionHeaderHover} transition-colors`}
            aria-expanded={expandedSections.titleStyles}
            aria-controls="title-styles-content"
          >
            <div className="flex items-center gap-2">
              <Type size={16} className={themeStyles.icon} />
              <span className="font-medium text-sm">Title Styles</span>
            </div>
            {expandedSections.titleStyles ? (
              <ChevronUp size={16} className={themeStyles.text} />
            ) : (
              <ChevronDown size={16} className={themeStyles.text} />
            )}
          </button>
          <div
            id="title-styles-content"
            className={`transition-all duration-300 ease-in-out ${expandedSections.titleStyles ? 'p-2 max-h-[600px]' : 'px-2 py-0 max-h-0'} overflow-hidden`}
          >
            <div>
              <input
                type="text"
                value={panel.title}
                onChange={(e) => handleTitleInput(e.target.value)}
                className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                aria-label="Panel Title"
              />
            </div>
            <div className="space-y-4">
              {/* Text Color */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    disabled={panel.panelStyles?.locked}
                    value={panel.titleStyle?.textColor || '#000000'}
                    onChange={(e) => handleTitleStyleChange('textColor', e.target.value)}
                    className={`w-10 h-9 rounded cursor-pointer border ${themeStyles.inputBorder}`}
                    aria-label="Title Text Color"
                  />
                  <input
                    type="text"
                    disabled={panel.panelStyles?.locked}
                    value={panel.titleStyle?.textColor || '#000000'}
                    onChange={(e) => handleTitleStyleChange('textColor', e.target.value)}
                    className={`flex-1 h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Title Text Color Text"
                  />
                </div>
              </div>

              {/* Font Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Font Size
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      disabled={panel.panelStyles?.locked}
                      min="8"
                      max="72"
                      step="1"
                      value={panel.titleStyle?.fontSize || 14}
                      onChange={(e) => handleTitleStyleChange('fontSize', parseInt(e.target.value))}
                      className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                      aria-label="Title Font Size"
                    />
                    <span className={`text-xs ${themeStyles.textSecondary}`}>px</span>
                  </div>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Font Style
                  </label>
                  <select
                    value={panel.titleStyle?.fontStyle || 'normal'}
                    disabled={panel.panelStyles?.locked}
                    onChange={(e) =>
                      handleTitleStyleChange('fontStyle', e.target.value as 'normal' | 'bold' | 'italic')
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Title Font Style"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>

              {/* Text Alignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Text Align
                  </label>
                  <select
                    value={panel.titleStyle?.textAlign || 'center'}
                    disabled={panel.panelStyles?.locked}
                    onChange={(e) =>
                      handleTitleStyleChange('textAlign', e.target.value as 'left' | 'center' | 'right')
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Title Text Align"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                    Text Transform
                  </label>
                  <select
                    value={panel.titleStyle?.textTransform || 'none'}
                    disabled={panel.panelStyles?.locked}
                    onChange={(e) =>
                      handleTitleStyleChange(
                        'textTransform',
                        e.target.value === 'none'
                          ? undefined
                          : (e.target.value as 'uppercase' | 'lowercase' | 'capitalize')
                      )
                    }
                    className={`w-full h-9 text-sm rounded px-2 ${themeStyles.inputBackground} ${themeStyles.text} border ${themeStyles.inputBorder}`}
                    aria-label="Title Text Transform"
                  >
                    <option value="none">None</option>
                    <option value="uppercase">Uppercase</option>
                    <option value="lowercase">Lowercase</option>
                    <option value="capitalize">Capitalize</option>
                  </select>
                </div>
              </div>

              {/* Opacity */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${themeStyles.textSecondary}`}>
                  Opacity: {Math.round((panel.titleStyle?.opacity || 1) * 100)}%
                </label>
                <input
                  type="range"
                  disabled={panel.panelStyles?.locked}
                  min="0"
                  max="1"
                  step="0.01"
                  value={panel.titleStyle?.opacity || 1}
                  onChange={(e) => handleTitleStyleChange('opacity', parseFloat(e.target.value))}
                  className={`w-full h-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg appearance-none cursor-pointer accent-blue-500`}
                  aria-label="Title Opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Layering Section */}
        <div className={`border rounded-lg overflow-hidden ${themeStyles.border}`}>
          <button
            onClick={() => toggleSection('layering')}
            className={`w-full flex items-center justify-between p-3 text-left ${themeStyles.sectionHeader} ${themeStyles.sectionHeaderHover} transition-colors`}
            aria-expanded={expandedSections.layering}
            aria-controls="layering-content"
          >
            <div className="flex items-center gap-2">
              <Layers size={16} className={themeStyles.icon} />
              <span className="font-medium text-sm">Layering</span>
            </div>
            {expandedSections.layering ? (
              <ChevronUp size={16} className={themeStyles.text} />
            ) : (
              <ChevronDown size={16} className={themeStyles.text} />
            )}
          </button>
          <div
            id="layering-content"
            className={`transition-all duration-300 ease-in-out ${expandedSections.layering ? 'p-2 max-h-[200px]' : 'px-2 py-0 max-h-0'} overflow-hidden`}
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                disabled={panel.panelStyles?.locked}
                onClick={() => handleZIndexAction('back')}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-sm ${themeStyles.layerButton} ${themeStyles.text} transition-colors`}
                aria-label="Send Backward"
              >
                <ArrowDown size={18} className="mb-1" />
                <span>Backward</span>
              </button>
              <button
                disabled={panel.panelStyles?.locked}
                onClick={() => handleZIndexAction('forward')}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-sm ${themeStyles.layerButton} ${themeStyles.text} transition-colors`}
                aria-label="Send Forward"
              >
                <ArrowUp size={18} className="mb-1" />
                <span>Forward</span>
              </button>
              <button
                disabled={panel.panelStyles?.locked}
                onClick={() => handleZIndexAction('toBack')}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-sm ${themeStyles.layerButton} ${themeStyles.text} transition-colors`}
                aria-label="Bring to Back"
              >
                <ChevronsDown size={18} className="mb-1" />
                <span>To Back</span>
              </button>
              <button
                disabled={panel.panelStyles?.locked}
                onClick={() => handleZIndexAction('toFront')}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-sm ${themeStyles.layerButton} ${themeStyles.text} transition-colors`}
                aria-label="Bring to Front"
              >
                <ChevronsUp size={18} className="mb-1" />
                <span>To Front</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
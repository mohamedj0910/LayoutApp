import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';
import { Trash2, Lock, Edit2Icon, Unlock } from 'lucide-react';
import { useTheme } from '../lib/ThemeContext';
import { PanelProps } from '../lib/types';

export const Panel: React.FC<PanelProps> = ({
  id,
  x,
  y,
  width,
  height,
  zIndex,
  shapeType,
  title,
  textContent,
  panelStyles = {},
  titleStyle = {},
  isSelected,
  showGrid,
  onDragStop,
  onResize,
  onRemove,
  onSelect,
  onTextChange,
  onTitleChange,
  onPanelStylesChange,
  onOpenSidebar,
  onDragStart,
  onResizeStart,
  onInteractionEnd,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { theme } = useTheme();
  const [isEditingText, setIsEditingText] = useState(false);
  const [newText, setNewText] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [hasMoved, setHasMoved] = useState(false); // Track if drag moved significantly
  const [isHovered, setIsHovered] = useState(false);
  const originalSize = useRef({ width: 0, height: 0 });
  const isShiftPressed = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null); // Store initial mouse position

  useEffect(() => {
    if (!isSelected) {
      setIsEditingText(false);
    }
  }, [isSelected]);

  useEffect(() => {

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        if (!isResizing) return;
        isShiftPressed.current = true;
      }
      if (e.key === 'Delete') {
        onRemove(id)
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') isShiftPressed.current = false;
    };



    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isResizing, isSelected]);

  const handleDragStart = useCallback(
    (e: DraggableEvent) => {
      e.stopPropagation();
      if ('clientX' in e) {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
      }
      onDragStart();
      onSelect(id);
    },
    [id, onDragStart, onSelect]
  );

  const handleLockToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPanelStylesChange(id, { locked: !panelStyles?.locked });
  };

  const handleDragStop = useCallback(
    (e: DraggableEvent, data: DraggableData) => {
      if (('clientX' in e && dragStartPos.current)) {
        console.log(e)
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx > 1 || dy > 1) {
          setHasMoved(true);
        }
      }
      dragStartPos.current = null; // Reset position
      onDragStop(id, data);
      onInteractionEnd();
    },
    [id, onDragStop, onInteractionEnd]
  );

  const handleResizeStart = useCallback(
    (e: React.SyntheticEvent, _data: ResizeCallbackData) => {
      e.stopPropagation();
      originalSize.current = { width, height };
      setIsResizing(true);
      onResizeStart();
    },
    [width, height, onResizeStart]
  );

  const handleResize = useCallback(
    (_e: React.SyntheticEvent, { size, handle }: { size: { width: number; height: number }; handle: string }) => {
      let newSize = { ...size };
      if (isShiftPressed.current && shapeType !== 'line' && shapeType !== 'text') {
        const aspectRatio = originalSize.current.width / originalSize.current.height;
        if (['e', 'w', 'ne', 'nw', 'se', 'sw'].includes(handle)) {
          newSize.height = newSize.width / aspectRatio;
        } else if (['n', 's'].includes(handle)) {
          newSize.width = newSize.height * aspectRatio;
        }
      }
      newSize.width = Math.max(newSize.width, shapeType === 'text' ? 100 : 100);
      newSize.height = Math.max(newSize.height, shapeType === 'text' ? 50 : 100);
      onResize(id, newSize, handle);
    },
    [id, onResize, shapeType]
  );

  const handleResizeStop = useCallback(
    (e: React.SyntheticEvent, _data: ResizeCallbackData) => {
      e.stopPropagation();
      setIsResizing(false);
      onInteractionEnd();
    },
    [onInteractionEnd]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(id);
    },
    [id, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditingText(true);
    },
    []
  );

  const handleTextBlur = useCallback(() => {
    if (shapeType === 'text') {
      onTextChange(id, newText);
    } else {
      onTitleChange(id, newText);
    }
    setIsEditingText(false);
  }, [id, newText, onTextChange, onTitleChange, shapeType]);

  const getShapePath = (shape: string, w: number, h: number) => {
    const padding = 5;
    const adjW = w - padding * 2;
    const adjH = h - padding * 2;
    switch (shape) {
      case 'rectangle':
        return `M${padding},${padding} h${adjW} v${adjH} h${-adjW} z`;
      case 'circle':
        return `M${w / 2},${padding} a${adjW / 2},${adjH / 2} 0 1,0 0,${adjH} a${adjW / 2},${adjH / 2} 0 1,0 0,${-adjH} z`;
      case 'triangle':
        return `M${padding},${h - padding} L${w / 2},${padding} L${w - padding},${h - padding} z`;
      case 'star':
        const starPoints = [
          [w / 2, padding],
          [w * 0.6, h * 0.3],
          [w - padding, h * 0.4],
          [w * 0.7, h * 0.6],
          [w * 0.8, h - padding],
          [w / 2, h * 0.7],
          [w * 0.2, h - padding],
          [w * 0.3, h * 0.6],
          [padding, h * 0.4],
          [w * 0.4, h * 0.3],
        ];
        return `M${starPoints[0][0]},${starPoints[0][1]} ${starPoints
          .slice(1)
          .map((p) => `L${p[0]},${p[1]}`)
          .join(' ')} z`;
      case 'diamond':
        return `M${w / 2},${padding} L${w - padding},${h / 2} L${w / 2},${h - padding} L${padding},${h / 2} z`;
      case 'line':
        return `M${padding},${h / 2} h${adjW}`;
      default:
        return '';
    }
  };

  const getStrokeDasharray = () => {
    switch (panelStyles.borderStyle) {
      case 'dashed':
        return `${Number(panelStyles.borderWidth) * 2},${Number(panelStyles.borderWidth) * 2}`;
      case 'dotted':
        return `${Number(panelStyles.borderWidth) / 5},${Number(panelStyles.borderWidth) * 2}`;
      default:
        return 'none';
    }
  };

  const rotationDegrees = panelStyles.rotate || 0;
  const viewBoxPadding = 0;
  const viewBox = `-${viewBoxPadding} -${viewBoxPadding} ${width + viewBoxPadding * 2} ${height + viewBoxPadding * 2}`;

  return (
    <Draggable
      position={{ x, y }}
      onStart={handleDragStart}
      onStop={handleDragStop}
      grid={showGrid ? [50, 50] : [1, 1]}
      disabled={isResizing || isEditingText || panelStyles.locked}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (!hasMoved) {
            onOpenSidebar(id);
          }
          setHasMoved(false);
        }}
        ref={containerRef}
        style={{
          zIndex,
          opacity: panelStyles.opacity ?? 1,
          transform: `rotate(${rotationDegrees}deg)`,
          transformOrigin: 'center center',
        }}
        className={`absolute ${isSelected ? 'selected-panel' : ''}`}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => {
          setIsHovered(true)
          onMouseEnter(id)
        }
        }
        onMouseLeave={() => {
          setIsHovered(false)
          onMouseLeave(id)
        }}
      >
        <ResizableBox
          draggableOpts={
            {
              disabled: panelStyles.locked,
              grid: showGrid ? [50, 50] : [1, 1]
            }
          }
          width={width}
          height={height}

          resizeHandles={['s', 'e', 'n', 'w', 'ne', 'nw', 'se', 'sw']}
          minConstraints={shapeType === 'text' ? [100, 50] : [100, 100]}
          onResizeStart={handleResizeStart}
          onResize={handleResize}
          onResizeStop={handleResizeStop}
          lockAspectRatio={isShiftPressed.current}
          className={`resizable-container`}
          style={{
            position: 'relative',
            transform: `rotate(${rotationDegrees}deg)`,
            transformOrigin: 'center center',
          }}
        >
          <div className={`${isSelected ? 'top selected' : ''}`}></div>
          <div className={`${isSelected ? 'right selected' : ''}`}></div>
          <div className={`${isSelected ? 'left selected' : ''}`}></div>
          <div className={`${isSelected ? 'bottom selected' : ''}`}></div>
          <div className="panel-content">
            <svg
              width="100%"
              height="100%"
              viewBox={viewBox}
              preserveAspectRatio="none"
              style={{
                overflow: 'visible',
              }}
            >

              {shapeType === 'text' ? (
                <foreignObject x="10" y="10" width={width - 20} height={height - 20}>
                  {isEditingText ? (
                    <textarea
                      value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onBlur={handleTextBlur}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTextBlur();
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        fontSize: `${titleStyle.fontSize || Math.min(Math.max(width / 10, 12), 24)}px`,
                        fontWeight: titleStyle.fontStyle === 'bold' ? 'bold' : 'normal',
                        fontStyle: titleStyle.fontStyle === 'italic' ? 'italic' : 'normal',
                        textAlign: titleStyle.textAlign || 'left',
                        textTransform: titleStyle.textTransform || 'none',
                        padding: '4px',
                        background: panelStyles.backgroundColor ?? (theme === 'dark' ? '#4B5563' : '#FFFFFF'),
                        color: titleStyle.textColor || (theme === 'dark' ? '#FFFFFF' : '#000000'),
                        opacity: titleStyle.opacity ?? 1,
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        lineHeight: '1.2',
                      }}
                      autoFocus
                      className="text-edit-area"
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        fontSize: `${titleStyle.fontSize || Math.min(Math.max(width / 10, 12), 24)}px`,
                        fontStyle: titleStyle.fontStyle || 'normal',
                        textAlign: titleStyle.textAlign || 'left',
                        textTransform: titleStyle.textTransform || 'none',
                        padding: '4px',
                        color: titleStyle.textColor || (theme === 'dark' ? '#FFFFFF' : '#000000'),
                        opacity: titleStyle.opacity ?? 1,
                        whiteSpace: 'pre-wrap',
                        overflow: 'hidden',
                        lineHeight: '1.2',
                      }}
                    >
                      {textContent}
                    </div>
                  )}
                </foreignObject>
              ) : (
                <path
                  className='outline-2 outline-offset-4 outline-red-700'
                  d={getShapePath(shapeType, width, height)}
                  fill={
                    panelStyles.backgroundColor === null
                      ? 'none'
                      : panelStyles.backgroundColor || (theme === 'dark' ? '#4B5563' : '#FFFFFF')
                  }
                  stroke={
                    panelStyles.borderColor === null
                      ? 'none'
                      : panelStyles.borderColor || (theme === 'dark' ? '#9CA3AF' : '#D1D5DB')
                  }
                  stroke-linecap={panelStyles.borderStyle == "dotted" ? 'round' : 'box'}
                  strokeWidth={panelStyles.borderWidth || 0}
                  strokeDasharray={getStrokeDasharray()}
                />
              )}
            </svg>

            {shapeType !== 'text' && (
              <div className="panel-title">
                {isEditingText ? (
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onBlur={handleTextBlur}
                    onClick={(e) => e.stopPropagation()}
                    onDoubleClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTextBlur();
                      }
                    }}
                    style={{
                      width: '100%',
                      fontSize: `${titleStyle.fontSize || 14}px`,
                      fontWeight: titleStyle.fontStyle === 'bold' ? 'bold' : 'normal',
                      fontStyle: titleStyle.fontStyle === 'italic' ? 'italic' : 'normal',
                      textAlign: titleStyle.textAlign || 'center',
                      textTransform: titleStyle.textTransform || 'none',
                      color: titleStyle.textColor || (theme === 'dark' ? '#FFFFFF' : '#000000'),
                      opacity: titleStyle.opacity ?? 1,
                      padding: '0 30px',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                      lineHeight: '1.2',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                    autoFocus
                    className="text-edit-area"
                  />
                ) : (
                  <span
                    style={{
                      width: '100%',
                      padding: '0 30px',
                      display: 'block',
                      fontSize: `${titleStyle.fontSize || 14}px`,
                      fontWeight: titleStyle.fontStyle === 'bold' ? 'bold' : 'normal',
                      fontStyle: titleStyle.fontStyle === 'italic' ? 'italic' : 'normal',
                      textAlign: titleStyle.textAlign || 'center',
                      textTransform: titleStyle.textTransform || 'none',
                      color: titleStyle.textColor || (theme === 'dark' ? '#FFFFFF' : '#000000'),
                      opacity: titleStyle.opacity ?? 1,
                    }}
                  >
                    {title}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="panel-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className={`delete-button ${theme === 'dark' ? 'dark' : 'light'}`}
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenSidebar(id);
              }}
              className={`move-button ${isSelected ? 'active' : ''} ${theme === 'dark' ? 'dark' : 'light'}`}
            >
              <Edit2Icon size={14} />
            </button>
          </div>

          {(isSelected || isHovered) &&
            <button
              onClick={handleLockToggle}
              className={`absolute top-[15px] right-[15px] bg-${panelStyles.locked ? 'blue-500' : 'gray-300'} p-[4px] rounded-sm ${isSelected ? 'lock-icon' : ''}`}
              aria-label={panelStyles.locked ? 'Unlock Panel' : 'Lock Panel'}
              style={{ zIndex: 10 }}
            >
              {panelStyles.locked ? <Lock className='' size={14} /> : <Unlock size={14} />}
            </button>
          }
        </ResizableBox>
      </div>
    </Draggable>
  );
};
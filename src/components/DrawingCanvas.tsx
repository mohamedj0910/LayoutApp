import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Toolbar } from './Toolbar';
import { Panel } from './Panel';
import { CanvasSettingsForm } from './CanvasSettingsForm';
import { addPanel, pastePanel, exportToPNG, exportConfig, importConfig } from '../lib/canvasUtils';
import { Panel as PanelType, CanvasConfig, TitleEdits, HistoryState } from '../lib/types';
import { DraggableData } from 'react-draggable';

export default function DrawingCanvas() {
  const { theme } = useTheme();
  const [panels, setPanels] = useState<PanelType[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [copiedPanel, setCopiedPanel] = useState<PanelType | null>(null);
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(720);
  const [isEditingCanvas, setIsEditingCanvas] = useState(false);
  const [newCanvasWidth, setNewCanvasWidth] = useState('1280');
  const [newCanvasHeight, setNewCanvasHeight] = useState('720');
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
  const [canvasFgColor, setCanvasFgColor] = useState('#000000');
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [titleEdits, setTitleEdits] = useState<TitleEdits>({});
  const [undoHistory, setUndoHistory] = useState<HistoryState[]>([]);
  const [redoHistory, setRedoHistory] = useState<HistoryState[]>([]);

  const saveState = useCallback(() => {
    const state: HistoryState = {
      panels,
      canvasWidth,
      canvasHeight,
      canvasBgColor,
      canvasFgColor,
      roundedCorners,
      showGrid,
    };
    setUndoHistory((prev) => [...prev, state]);
    setRedoHistory([]);
  }, [panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid]);

  const undo = useCallback(() => {
    if (undoHistory.length === 0) return;
    const previousState = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));
    setRedoHistory((prev) => [
      ...prev,
      { panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid },
    ]);
    setPanels(previousState.panels);
    setCanvasWidth(previousState.canvasWidth);
    setCanvasHeight(previousState.canvasHeight);
    setCanvasBgColor(previousState.canvasBgColor);
    setCanvasFgColor(previousState.canvasFgColor);
    setRoundedCorners(previousState.roundedCorners);
    setShowGrid(previousState.showGrid);
    setSelectedPanel(null);
  }, [undoHistory, panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid]);

  const redo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const nextState = redoHistory[redoHistory.length - 1];
    setRedoHistory((prev) => prev.slice(0, -1));
    setUndoHistory((prev) => [
      ...prev,
      { panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid },
    ]);
    setPanels(nextState.panels);
    setCanvasWidth(nextState.canvasWidth);
    setCanvasHeight(nextState.canvasHeight);
    setCanvasBgColor(nextState.canvasBgColor);
    setCanvasFgColor(nextState.canvasFgColor);
    setRoundedCorners(nextState.roundedCorners);
    setShowGrid(nextState.showGrid);
    setSelectedPanel(null);
  }, [redoHistory, panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        setIsCtrlPressed(true);
        if (e.key === 'c' && selectedPanel) {
          const panelToCopy = panels.find((panel) => panel.id === selectedPanel);
          if (panelToCopy) setCopiedPanel({ ...panelToCopy });
        } else if (e.key === 'v' && copiedPanel) {
          saveState();
          setPanels((prev) => pastePanel(prev, copiedPanel));
        } else if (e.key === 'z') {
          undo();
        } else if (e.key === 'y') {
          redo();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedPanel, copiedPanel, undoHistory, redoHistory, saveState, undo, redo]);

  const handleAddSquare = useCallback(() => {
    saveState();
    setPanels((prev) => addPanel(prev, false));
  }, [saveState]);

  const handleAddCircle = useCallback(() => {
    saveState();
    setPanels((prev) => addPanel(prev, true));
  }, [saveState]);

  const handleRemovePanel = useCallback(
    (id: string) => {
      saveState();
      setPanels((prev) => prev.filter((panel) => panel.id !== id));
      setSelectedPanel(null);
    },
    [saveState]
  );

  const handleClearPanels = useCallback(() => {
    saveState();
    setPanels([]);
    setSelectedPanel(null);
  }, [saveState]);

  const handleDragStop = useCallback(
    (id: string, data: DraggableData) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, x: data.x, y: data.y } : panel
        )
      );
    },
    [saveState]
  );

  const handleResize = useCallback(
    (id: string, size: { width: number; height: number }, handle: string) => {
      saveState();
      setPanels((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
              ...p,
              width: size.width,
              height: size.height,
              x: p.x + (['w', 'nw', 'sw'].includes(handle) ? p.width - size.width : 0),
              y: p.y + (['n', 'nw', 'ne'].includes(handle) ? p.height - size.height : 0),
            }
            : p
        )
      );
    },
    [saveState]
  );

  const handleToggleMoveMode = useCallback(() => {
    setMoveMode((prev) => !prev);
  }, []);

  const handleSelectPanel = useCallback((id: string) => {
    setSelectedPanel(id);
  }, []);

  const handleTitleChange = useCallback(
    (id: string, title: string) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, title } : panel
        )
      );
      setTitleEdits((prev) => {
        const newEdits = { ...prev };
        delete newEdits[id];
        return newEdits;
      });
    },
    [saveState]
  );

  const handleCanvasSubmit = useCallback(
    (width: number, height: number) => {
      if (!isNaN(width) && !isNaN(height) && width >= 200 && height >= 200) {
        saveState();
        setCanvasWidth(width);
        setCanvasHeight(height);
      }
      setIsEditingCanvas(false);
    },
    [saveState]
  );


  const handleImportConfig = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      saveState();
      importConfig(event, (config: CanvasConfig) => {
        setPanels(config.panels);
        setCanvasWidth(config.canvasWidth);
        setCanvasHeight(config.canvasHeight);
        setCanvasBgColor(config.canvasBgColor);
        setCanvasFgColor(config.canvasFgColor);
        setRoundedCorners(config.roundedCorners);
        setShowGrid(config.showGrid);
      });
    },
    [saveState]
  );

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}
    >
      <div className="container mx-auto px-4 py-8">
        <Toolbar
          onAddSquare={handleAddSquare}
          onAddCircle={handleAddCircle}
          onClearPanels={handleClearPanels}
          onToggleCanvasSettings={() => setIsEditingCanvas(!isEditingCanvas)}
          onExportToPNG={() => exportToPNG(canvasBgColor)}
          onExportConfig={() =>
            exportConfig({
              panels,
              canvasWidth,
              canvasHeight,
              canvasBgColor,
              canvasFgColor,
              roundedCorners,
              showGrid,
            })
          }
          onImportConfig={handleImportConfig}
        />
        <div className="flex justify-center items-center">
          <div
            className={`relative border-2 canvas-container transition-colors duration-200 overflow-hidden ${roundedCorners ? 'rounded-xl' : ''
              } ${showGrid ? 'grid-background' : ''}`}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              backgroundColor: canvasBgColor,
              color: canvasFgColor,
              backgroundImage: showGrid
                ? `linear-gradient(${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                } 1px, transparent 1px),
                  linear-gradient(90deg, ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                } 1px, transparent 1px)`
                : 'none',
              backgroundSize: showGrid ? '10px 10px' : 'auto',
            }}
          >
            <CanvasSettingsForm
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              canvasBgColor={canvasBgColor}
              canvasFgColor={canvasFgColor}
              roundedCorners={roundedCorners}
              showGrid={showGrid}
              isEditing={isEditingCanvas}
              onSubmit={handleCanvasSubmit}
              onCancel={() => setIsEditingCanvas(false)}
              onBgColorChange={setCanvasBgColor}
              onFgColorChange={setCanvasFgColor}
              onToggleRoundedCorners={() => setRoundedCorners(!roundedCorners)}
              onToggleShowGrid={() => setShowGrid(!showGrid)}
              onWidthChange={setNewCanvasWidth}
              onHeightChange={setNewCanvasHeight}
              newCanvasWidth={newCanvasWidth}
              newCanvasHeight={newCanvasHeight}
            />

            {panels.map((panel) => (
              <Panel
                key={panel.id}
                id={panel.id}
                x={panel.x}
                y={panel.y}
                width={panel.width}
                height={panel.height}
                zIndex={panel.zIndex}
                title={panel.title}
                isCircle={panel.isCircle}
                isSelected={selectedPanel === panel.id}
                isCtrlPressed={isCtrlPressed}
                moveMode={moveMode}
                roundedCorners={roundedCorners}
                onDragStop={handleDragStop}
                onResize={handleResize}
                onRemove={handleRemovePanel}
                onSelect={handleSelectPanel}
                onToggleMoveMode={handleToggleMoveMode}
                onTitleChange={handleTitleChange}
                resizeHandles={['s', 'e', 'n', 'w', 'ne', 'nw', 'se', 'sw']}
                minConstraints={[100, 100]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
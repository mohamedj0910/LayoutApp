import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Toolbar } from './Toolbar';
import { Panel } from './Panel';
import { CanvasSettingsForm } from './CanvasSettingsForm';
import { RightSidebar } from './RightSidebar';
import { addPanel, pastePanel, exportToPNG, exportConfig, importConfig } from '../lib/canvasUtils';
import { Panel as PanelType, CanvasConfig, HistoryState, TitleStyle, PanelStyles } from '../lib/types';
import { DraggableData } from 'react-draggable';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';


export default function DrawingCanvas() {
  const { theme } = useTheme();
  const [panels, setPanels] = useState<PanelType[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [copiedPanel, setCopiedPanel] = useState<PanelType | null>(null);
  const [_isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(720);
  const [isEditingCanvas, setIsEditingCanvas] = useState(false);
  const [newCanvasWidth, setNewCanvasWidth] = useState('1280');
  const [newCanvasHeight, setNewCanvasHeight] = useState('720');
  const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
  const [canvasFgColor, setCanvasFgColor] = useState('#000000');
  const [roundedCorners, setRoundedCorners] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [undoHistory, setUndoHistory] = useState<HistoryState[]>([]);
  const [redoHistory, setRedoHistory] = useState<HistoryState[]>([]);
  const [isInteractingWithPanel, setIsInteractingWithPanel] = useState(false);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [editingTextPanel, setEditingTextPanel] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarPanelId, setSidebarPanelId] = useState<string | null>(null);
  const [mouseOnCanvas, setMouseOnCanvas] = useState(false);
  const transformRef = useRef<any>(null);

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
    setEditingTextPanel(null);
    setIsSidebarOpen(false);
    setSidebarPanelId(null);
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
    setEditingTextPanel(null);
    setIsSidebarOpen(false);
    setSidebarPanelId(null);
  }, [redoHistory, panels, canvasWidth, canvasHeight, canvasBgColor, canvasFgColor, roundedCorners, showGrid]);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true);
        if (e.key === 'c' && selectedPanel) {
          const panelToCopy = panels.find((panel) => panel.id === selectedPanel);
          if (panelToCopy) setCopiedPanel({ ...panelToCopy });
        } else if (e.key === 'v' && copiedPanel) {
          saveState();
          const scale = 1;
          console.log('scale : ', transformRef.current?.instance?.state?.scale)
          setPanels((prev) => pastePanel(prev, copiedPanel, { scale }));
        } else if (e.key === 'z') {
          undo();
        } else if (e.key === 'y') {
          redo();
        }
        else if ((e.key === '=' || e.key === '+') && mouseOnCanvas) {
          e.preventDefault();
          transformRef.current?.zoomIn(0.2);
        }
        else if (e.key == '-' && mouseOnCanvas) {
          e.preventDefault()
          transformRef.current?.zoomOut(0.2)
        }
        else if (e.key == '0' && mouseOnCanvas) {
          e.preventDefault()
          transformRef.current?.setTransform(0, 0, 0.8, 1000)
        }
      }
    };
    const escPressed = (e: KeyboardEvent) => {
      if (e.key == 'Escape') {
        if (isEditingCanvas) {
          setIsEditingCanvas(false)
        }
        setIsSidebarOpen(false)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control') setIsCtrlPressed(false);
    };

    window.addEventListener('keydown', escPressed)
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.addEventListener('keydown', escPressed)
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mouseOnCanvas, selectedPanel, copiedPanel, undoHistory, redoHistory, saveState, undo, redo, isEditingCanvas]);

  const handleAddShape = useCallback(
    (shapeType: PanelType['shapeType']) => {
      saveState();
      const scale = 1;
      setPanels((prev) => addPanel(prev, shapeType, { scale }));
    },
    [saveState]
  );
 
  console.log(transformRef.current)

  const handleRemovePanel = useCallback(
    (id: string) => {
      saveState();
      setPanels((prev) => prev.filter((panel) => panel.id !== id));
      setSelectedPanel(null);
      if (id === editingTextPanel) setEditingTextPanel(null);
      if (id === hoveredPanel) setHoveredPanel(null);
      if (id === sidebarPanelId) {
        setIsSidebarOpen(false);
        setSidebarPanelId(null);
      }
    },
    [saveState, editingTextPanel, hoveredPanel, sidebarPanelId]
  );

  const handleClearPanels = useCallback(() => {
    saveState();
    setPanels([]);
    setSelectedPanel(null);
    setEditingTextPanel(null);
    setHoveredPanel(null);
    setIsSidebarOpen(false);
    setSidebarPanelId(null);
  }, [saveState]);

  const handleDragStop = useCallback(
    (id: string, data: DraggableData) => {
      saveState();
      const scale = 1;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id
            ? { ...panel, x: data.x / scale, y: data.y / scale }
            : panel
        )
      );
      setIsInteractingWithPanel(false);
    },
    [saveState]
  );

  const handleResize = useCallback(
    (id: string, size: { width: number; height: number }, handle: string) => {
      saveState();
      const scale = 1;
      setPanels((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
              ...p,
              width: size.width / scale,
              height: size.height / scale,
              x: p.x + (['w', 'nw', 'sw'].includes(handle) ? p.width - size.width / scale : 0),
              y: p.y + (['n', 'nw', 'ne'].includes(handle) ? p.height - size.height / scale : 0),
            }
            : p
        )
      );
    },
    [saveState]
  );

  const handleSelectPanel = useCallback((id: string) => {
    setSelectedPanel(id);
  }, []);

  const handleTextChange = useCallback(
    (id: string, text: string) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, textContent: text, title: text } : panel
        )
      );
      setEditingTextPanel(null);
    },
    [saveState]
  );

  const handleTitleChange = useCallback(
    (id: string, title: string) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, title, ...(panel.shapeType === 'text' ? { textContent: title } : {}) } : panel
        )
      );
    },
    [saveState]
  );

  const handlePanelStylesChange = useCallback(
    (id: string, styles: PanelStyles) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, panelStyles: { ...panel.panelStyles, ...styles } } : panel
        )
      );
    },
    [saveState]
  );

  const handleTitleStyleChange = useCallback(
    (id: string, styles: TitleStyle) => {
      saveState();
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id ? { ...panel, titleStyle: { ...panel.titleStyle, ...styles } } : panel
        )
      );
    },
    [saveState]
  );

  const handleZIndexChange = useCallback(
    (id: string, action: 'back' | 'forward' | 'toBack' | 'toFront') => {
      saveState();
      setPanels((prev) => {
        const sortedPanels = [...prev].sort((a, b) => a.zIndex - b.zIndex);
        const index = sortedPanels.findIndex((p) => p.id === id);
        if (index === -1) return prev;

        let newPanels = [...sortedPanels];
        if (action === 'back' && index > 0) {
          [newPanels[index], newPanels[index - 1]] = [newPanels[index - 1], newPanels[index]];
        } else if (action === 'forward' && index < newPanels.length - 1) {
          [newPanels[index], newPanels[index + 1]] = [newPanels[index + 1], newPanels[index]];
        } else if (action === 'toBack') {
          const [panel] = newPanels.splice(index, 1);
          newPanels.unshift(panel);
        } else if (action === 'toFront') {
          const [panel] = newPanels.splice(index, 1);
          newPanels.push(panel);
        }
        return newPanels.map((panel, i) => ({ ...panel, zIndex: i + 1 }));
      });
    },
    [saveState]
  );

  const handlePanelDimensionsChange = useCallback(
    (id: string, dimensions: { width?: number; height?: number; x?: number; y?: number }) => {
      saveState();
      const scale = 1;
      setPanels((prev) =>
        prev.map((panel) =>
          panel.id === id
            ? {
              ...panel,
              width: dimensions.width !== undefined ? dimensions.width / scale : panel.width,
              height: dimensions.height !== undefined ? dimensions.height / scale : panel.height,
              x: dimensions.x !== undefined ? dimensions.x / scale : panel.x,
              y: dimensions.y !== undefined ? dimensions.y / scale : panel.y,
            }
            : panel
        )
      );
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
        setEditingTextPanel(null);
        setHoveredPanel(null);
        setIsSidebarOpen(false);
        setSidebarPanelId(null);
      });
    },
    [saveState]
  );

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedPanel(null);
      setIsSidebarOpen(false);
      setSidebarPanelId(null);
      setIsEditingCanvas(false)
    }
  }, []);

  const handleDragStart = useCallback(() => {
    setIsInteractingWithPanel(true);
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsInteractingWithPanel(true);
  }, []);

  const handleInteractionEnd = useCallback(() => {
    setIsInteractingWithPanel(false);
  }, []);

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredPanel(id);
  }, []);

  const handleMouseLeave = useCallback((id: string) => {
    if (hoveredPanel === id) {
      setHoveredPanel(null);
    }
  }, [hoveredPanel]);

  const handleTextEditStart = useCallback(
    (id: string) => {
      setEditingTextPanel(id);
    },
    []
  );

  const handleOpenSidebar = useCallback(
    (id: string) => {
      if (isSidebarOpen && sidebarPanelId === id) {
        setIsSidebarOpen(false);
        setSidebarPanelId(null);
      } else {
        setSidebarPanelId(id);
        setIsSidebarOpen(true);
      }
      setSelectedPanel(id);
    },
    [isSidebarOpen, sidebarPanelId]
  );

  const selectedPanelData = panels.find((panel) => panel.id === sidebarPanelId) || null;

  return (
    <div
      className={`flex gap-[80px] ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}
    >
      <Toolbar
        onAddRectangle={() => handleAddShape('rectangle')}
        onAddCircle={() => handleAddShape('circle')}
        onAddTriangle={() => handleAddShape('triangle')}
        onAddStar={() => handleAddShape('star')}
        onAddDiamond={() => handleAddShape('diamond')}
        onAddLine={() => handleAddShape('line')}
        onAddText={() => handleAddShape('text')}
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
      <div
        className="flex-1 px-4 py-8 relative"
        onMouseEnter={() => setMouseOnCanvas(true)}
        onMouseLeave={() => setMouseOnCanvas(false)}
      >
        <div className="flex justify-center items-center">
          <TransformWrapper
            initialScale={0.8}
            minScale={0.4}
            maxScale={4}
            limitToBounds={true}
            centerZoomedOut={true}
            wheel={{ step: 0.1 }}
            pinch={{ step: 0.1 }}
            disabled={isInteractingWithPanel || !!hoveredPanel || !!editingTextPanel}
            ref={transformRef}
          >
            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
              <div
                className={`canvas-container relative border-2 border-black transition-colors duration-200 overflow-hidden ${roundedCorners ? 'rounded-xl' : ''}`}
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  background: canvasBgColor,
                  color: canvasFgColor,
                }}
                onClick={handleCanvasClick}
              >
                {panels.map((panel) => (
                  <Panel
                    key={panel.id}
                    id={panel.id}
                    x={panel.x}
                    y={panel.y}
                    width={panel.width}
                    height={panel.height}
                    zIndex={panel.zIndex}
                    shapeType={panel.shapeType}
                    title={panel.title}
                    textContent={panel.textContent}
                    panelStyles={panel.panelStyles}
                    titleStyle={panel.titleStyle}
                    isSelected={panel.id === selectedPanel}
                    roundedCorners={roundedCorners}
                    showGrid={showGrid}
                    onDragStop={handleDragStop}
                    onResize={handleResize}
                    onRemove={handleRemovePanel}
                    onSelect={handleSelectPanel}
                    onTextChange={handleTextChange}
                    onTitleChange={handleTitleChange}
                    onPanelStylesChange={handlePanelStylesChange}
                    onTitleStyleChange={handleTitleStyleChange}
                    onOpenSidebar={handleOpenSidebar}
                    onDragStart={handleDragStart}
                    onResizeStart={handleResizeStart}
                    onInteractionEnd={handleInteractionEnd}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTextEditStart={handleTextEditStart}
                  />
                ))}
                <div
                  className={`absolute top-0 -z-1 bottom-0 left-0 right-0 ${showGrid ? 'grid-background' : ''}`}
                  onClick={handleCanvasClick}
                >

                </div>
              </div>
            </TransformComponent>
          </TransformWrapper>
          {isEditingCanvas && (
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
          )}
        </div>
        <RightSidebar
          panel={selectedPanelData}
          panels={panels}
          isOpen={isSidebarOpen}
          onClose={() => {
            setIsSidebarOpen(false);
            setSidebarPanelId(null);
          }}
          onTitleChange={handleTitleChange}
          onPanelStylesChange={handlePanelStylesChange}
          onTitleStyleChange={handleTitleStyleChange}
          onZIndexChange={handleZIndexChange}
          onPanelDimensionsChange={handlePanelDimensionsChange}
        />
      </div>
    </div>
  );
}
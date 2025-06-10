import { DraggableData } from 'react-draggable';
import { ResizableBoxProps } from 'react-resizable';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface Panel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  title: string;
  isCircle: boolean;
}

export interface CanvasConfig {
  panels: Panel[];
  canvasWidth: number;
  canvasHeight: number;
  canvasBgColor: string;
  canvasFgColor: string;
  roundedCorners: boolean;
  showGrid: boolean;
}

export type TitleEdits = Record<string, string>;

export type HistoryState = CanvasConfig;

export interface PanelProps extends Pick<ResizableBoxProps, 'resizeHandles' | 'minConstraints'> {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  title: string;
  isCircle: boolean;
  isSelected: boolean;
  isCtrlPressed: boolean;
  moveMode: boolean;
  roundedCorners: boolean;
  onDragStop: (id: string, data: DraggableData) => void;
  onResize: (id: string, size: { width: number; height: number }, handle: string) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onToggleMoveMode: () => void;
  onTitleChange: (id: string, title: string) => void;
}

export interface ToolbarProps {
  onAddSquare: () => void;
  onAddCircle: () => void;
  onClearPanels: () => void;
  onToggleCanvasSettings: () => void;
  onExportToPNG: () => void;
  onExportConfig: () => void;
  onImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface CanvasSettingsFormProps {
  canvasWidth: number;
  canvasHeight: number;
  canvasBgColor: string;
  canvasFgColor: string;
  roundedCorners: boolean;
  showGrid: boolean;
  isEditing: boolean;
  onSubmit: (width: number, height: number) => void;
  onCancel: () => void;
  onBgColorChange: (color: string) => void;
  onFgColorChange: (color: string) => void;
  onToggleRoundedCorners: () => void;
  onToggleShowGrid: () => void;
  onWidthChange: (width: string) => void;
  onHeightChange: (height: string) => void;
  newCanvasWidth: string;
  newCanvasHeight: string;
}

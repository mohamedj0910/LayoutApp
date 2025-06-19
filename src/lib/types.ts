import { DraggableData } from 'react-draggable';

export type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export interface PanelStyles {
  backgroundColor?: string | null;
  borderColor?: string | null;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  rotate?: number;
  opacity?: number;
  locked?: boolean;
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

export type HistoryState = CanvasConfig;

export interface Panel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'line' | 'text';
  title: string;
  textContent?: string;
  panelStyles?: PanelStyles;
  titleStyle?: TitleStyle;
}

export interface TitleStyle {
  textColor?: string;
  fontSize?: number;
  fontStyle?: 'normal' | 'bold' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  opacity?: number;
}

export interface PanelProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond' | 'line' | 'text';
  title: string;
  textContent?: string;
  panelStyles?: PanelStyles;
  titleStyle?: TitleStyle;
  isSelected: boolean;
  roundedCorners: boolean;
  showGrid:boolean
  onDragStop: (id: string, data: DraggableData) => void;
  onResize: (id: string, size: { width: number; height: number }, handle: string) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  onTextChange: (id: string, text: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onPanelStylesChange: (id: string, styles: PanelStyles) => void;
  onTitleStyleChange: (id: string, styles: TitleStyle) => void;
  onOpenSidebar: (id: string) => void;
  onDragStart: () => void;
  onResizeStart: () => void;
  onInteractionEnd: () => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onTextEditStart: (id: string) => void;
  isSidebarOpen?: boolean;
}

export interface ToolbarProps {
  onAddRectangle: () => void;
  onAddCircle: () => void;
  onAddTriangle: () => void;
  onAddStar: () => void;
  onAddDiamond: () => void;
  onAddLine: () => void;
  onAddText: () => void;
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

export interface RightSidebarProps {
  panel: Panel | null;
  panels: Panel[];
  isOpen: boolean;
  onClose: () => void;
  onPanelStylesChange: (id: string, styles: PanelStyles) => void;
  onTitleStyleChange: (id: string, styles: TitleStyle) => void;
  onZIndexChange: (id: string, action: 'back' | 'forward' | 'toBack' | 'toFront') => void;
  onTitleChange: (id: string, title: string) => void;
  onPanelDimensionsChange: (id: string, dimensions: { width?: number; height?: number; x?: number; y?: number }) => void;
}
import { CanvasConfig, Panel } from './types';
import html2canvas from 'html2canvas';

export const addPanel = (
  panels: Panel[],
  shapeType: Panel['shapeType'],
  options: { scale?: number } = {}
): Panel[] => {
  const { scale = 1 } = options;
  const canvas = document.querySelector('.canvas-container');
  if (!canvas) return panels;
  const rect = canvas.getBoundingClientRect();
  const x = rect.x/2+2
  const y = rect.y+20
  const maxZIndex = panels.length > 0 ? Math.max(...panels.map((p) => p.zIndex)) : 0;
  return [
    ...panels,
    {
      id: crypto.randomUUID(),
      x,
      y,
      width: shapeType === 'line' ? 200 / scale : shapeType === 'text' ? 200 / scale : 400 / scale,
      height: shapeType === 'line' ? 20 / scale : shapeType === 'text' ? 50 / scale : 400 / scale,
      zIndex: maxZIndex + 1,
      shapeType,
      title: shapeType === 'text' ? 'Text' : "",
      ...(shapeType === 'text' ? { textContent: 'Text' } : {}),
      panelStyles: {
        backgroundColor: '#FFFFFF',
        borderColor: '#D1D5DB',
        borderWidth: 2,
        borderStyle: 'solid',
        rotate: 0,
        opacity: 1,
        locked: false,
      },
      titleStyle: {
        textColor: '#000000',
        fontSize: 14,
        fontStyle: 'normal',
        textAlign: 'center',
        textTransform: undefined,
        opacity: 1,
      },
    },
  ];
};

export const pastePanel = (
  panels: Panel[],
  copiedPanel: Panel | null,
  options: { scale?: number } = {}
): Panel[] => {
  if (!copiedPanel) return panels;
  const { scale = 1 } = options;
  const canvas = document.querySelector('.canvas-container');
  if (!canvas) return panels;
  const rect = canvas.getBoundingClientRect();
  const x = (rect.width / 2 - copiedPanel.width / 2) / scale;
  const y = (rect.height / 2 - copiedPanel.height / 2) / scale;
  const maxZIndex = panels.length > 0 ? Math.max(...panels.map((p) => p.zIndex)) : 0;
  return [
    ...panels,
    {
      ...copiedPanel,
      id: crypto.randomUUID(),
      x,
      y,
      zIndex: maxZIndex + 1,
      title: copiedPanel.title,
      panelStyles: { ...copiedPanel.panelStyles },
      titleStyle: { ...copiedPanel.titleStyle },
    },
  ];
};

export const exportToPNG = (canvasBgColor: string): void => {
  const canvas = document.querySelector('.canvas-container');
  if (canvas) {
    html2canvas(canvas as HTMLElement, {
      backgroundColor: canvasBgColor,
      scale: 2,
      logging: false,
    }).then((canvasElement: HTMLCanvasElement) => {
      const link = document.createElement('a');
      link.download = 'panel-drawing.png';
      link.href = canvasElement.toDataURL('image/png');
      link.click();
    });
  }
};

export const exportConfig = (config: CanvasConfig): void => {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'panel-layout.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importConfig = (
  event: React.ChangeEvent<HTMLInputElement>,
  setConfig: (config: CanvasConfig) => void
): void => {
  const file = event.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config: CanvasConfig = JSON.parse(e.target?.result as string);
        setConfig(config);
      } catch (error) {
        console.error('Error importing configuration:', error);
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  }
};
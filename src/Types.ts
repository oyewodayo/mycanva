export interface DrawCanvasProps{
    canvasWindowScroll?:boolean;
    initialPenColor?: string;
    initialBackgroundColor?:string;
    initialLineWidth?: number;
}

export interface ShapeButtonProps {
    handleButtonClick: (buttonName: string) => void;
    activeButton: string | null;
  }
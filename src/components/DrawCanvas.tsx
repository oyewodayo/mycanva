import React, { useEffect, useRef, useState } from 'react'

const DrawCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement  | null>(null);
    const contextREf = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);


    useEffect(()=>{
        const canvas = canvasRef.current;
        if (canvas) {            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const context = canvas.getContext("2d");
            if (context) {
                
                context.lineCap = "round";
                context.strokeStyle = "black";
                context.lineWidth = 4;
            }
            contextREf.current = context;
        }

            
        const preventDefault = (e: Event) => {
            e.preventDefault();
        };

        document.body.addEventListener('touchstart', preventDefault, { passive: false });
        document.body.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
        };
    
    }, []);

    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if ('touches' in event) {
            const touch = event.touches[0];
            const rect = canvasRef.current?.getBoundingClientRect();
            return {
                offsetX: touch.clientX - (rect?.left || 0),
                offsetY: touch.clientY - (rect?.top || 0)
            };
        } else {
            return {
                offsetX: event.nativeEvent.offsetX,
                offsetY: event.nativeEvent.offsetY
            };
        }
    };

    const startDrawing = (event:React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        const { offsetX, offsetY } = getCoordinates(event);
        
        if (contextREf.current) {
            
            contextREf.current?.beginPath();
            contextREf.current?.moveTo(offsetX, offsetY);
        }

        setIsDrawing(true);

       
    }

    const draw = (event:React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        if (!isDrawing) return;

         const { offsetX, offsetY } = getCoordinates(event); 
        if (contextREf.current) {
            
            contextREf.current?.lineTo(offsetX, offsetY);
            contextREf.current?.stroke();
        }
       
    }

    const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        if (isDrawing && contextREf.current) {
            
            contextREf.current?.closePath();
            setIsDrawing(false);
        }
    }
  return (
  
    <canvas 
    className="w-full h-screen"
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        >
    
    </canvas>
           
        
  )
}

export default DrawCanvas
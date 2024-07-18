import React, { useEffect, useRef, useState } from 'react'

const DrawCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement  | null>(null);
    const contextREf = useRef<CanvasRenderingContext2D | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);


    useEffect(()=>{
        const canvas = canvasRef.current;
        if (canvas) {            
            canvas.width = 900;
            canvas.height = 900;
            const context = canvas.getContext("2d");
            if (context) {
                
                context.lineCap = "round";
                context.strokeStyle = "black";
                context.lineWidth = 4;
            }
            contextREf.current = context;
        }
    
    }, [])

    const startDrawing = (event:React.MouseEvent<HTMLCanvasElement>)=>{
        const {nativeEvent} = event;
        const {offsetX, offsetY} = nativeEvent;
        contextREf.current?.beginPath();
        contextREf.current?.moveTo(offsetX, offsetY);
        contextREf.current?.lineTo(offsetX, offsetY);
        contextREf.current?.stroke();
        setIsDrawing(true);

        nativeEvent.preventDefault();
    }

    const draw = (event:React.MouseEvent<HTMLCanvasElement>)=>{
        const {nativeEvent} = event;
        if (!isDrawing) {
            return;
        }
        const {offsetX, offsetY} = nativeEvent; 
        contextREf.current?.lineTo(offsetX, offsetY);
        contextREf.current?.stroke();
        nativeEvent.preventDefault();
    }

    const stopDrawing = ()=>{
        contextREf.current?.closePath();
        setIsDrawing(false);
    }
  return (
  
    <canvas 
    className='bg-black border-2 border-black'
       id="canvas" 
        ref={canvasRef} 
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseLeave={stopDrawing}>
    
    </canvas>
           
        
  )
}

export default DrawCanvas
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { BsEraser, BsFillEraserFill, BsSteam } from 'react-icons/bs';
import { GrDrag } from 'react-icons/gr';
import { IoPencil, IoSettings } from 'react-icons/io5';
import { TbBackground } from 'react-icons/tb';

interface DrawCanvasProps{
    initialColor?: string;
    initialLineWidth?: number;
}
const DrawCanvas = ({initialColor='black',initialLineWidth=4}:DrawCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const pencilButtonRef = useRef<HTMLButtonElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [penColor, setPenColor] = useState<string>(initialColor);
    const [penSize, setPenSize] = useState(initialLineWidth);
    const [showControls, setShowControls] = useState(false);
    const [controlsPosition, setControlsPosition] = useState({ top: 0, left: 0 });
    const [drawerPanelOption, setDrawerPanelOption] = useState<string>("horizontal");

    const handleButtonClick = (buttonName:string) => {
        setActiveButton(buttonName);
      };


    const toggleControls = () => {
        if (pencilButtonRef.current) {
            const rect = pencilButtonRef.current.getBoundingClientRect();
            setControlsPosition({
                top: rect.top - 10,
                left: rect.left - 120, // Adjust this value to position the controls correctly
            });
        }
        setShowControls(!showControls);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPenColor(e.target.value);
        if (contextRef.current && !isErasing) {
            contextRef.current.strokeStyle = e.target.value;
        }
    }

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value);
        setPenSize(newSize);
        if (contextRef.current) {
            contextRef.current.lineWidth = newSize;
        }
    }
    
    const initializeCanvas = useCallback(()=>{
        const canvas = canvasRef.current;
        if (canvas) {            
            // canvas.width = 500;
            // canvas.height = 500;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const context = canvas.getContext("2d");
            if (context) {
                
                context.lineCap = "round";
                context.strokeStyle = "black";
                context.lineWidth = 4;
            }
            contextRef.current = context;
        }
    },[initialColor,initialLineWidth])


    useEffect(()=>{
        initializeCanvas();

        const handleResize = ()=>{
            initializeCanvas();
        }

        window.addEventListener('resize',handleResize)
            
        const preventDefault = (e: Event) => {
            e.preventDefault();
        };

        document.body.addEventListener('touchstart', preventDefault, { passive: false });
        document.body.addEventListener('touchmove', preventDefault, { passive: false });

        return () => {
            window.removeEventListener('resize',handleResize);
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
        };
    
    }, [initializeCanvas]);

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

    //
    const setToDraw = ()=>{
        if (contextRef.current) {
            contextRef.current.globalCompositeOperation = "source-over";
            setIsErasing(false)
        }
    }
    
    //
    const setToErase = ()=>{
        
        if (contextRef.current) {
            contextRef.current.globalCompositeOperation = "destination-out";
            setIsErasing(true)
        }

    }
    const startDrawing = (event:React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        const { offsetX, offsetY } = getCoordinates(event);
        
        if (contextRef.current) {
            
            contextRef.current?.beginPath();
            contextRef.current?.moveTo(offsetX, offsetY);
        }

        setIsDrawing(true);
        setShowControls(false);

       
    }

    const draw = useCallback((event:React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        if (!isDrawing) return;

         const { offsetX, offsetY } = getCoordinates(event); 
        if (contextRef.current) {
            
            contextRef.current?.lineTo(offsetX, offsetY);
            contextRef.current?.stroke();
        }
       
    },[isDrawing]);

    const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>)=>{
        event.preventDefault();
        if (isDrawing && contextRef.current) {
            
            contextRef.current?.closePath();
            setIsDrawing(false);
        }
    }

    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [draw]);

    const clearCanvas = ()=>{
        if (contextRef.current) {
            
            contextRef.current.clearRect(0, 0, contextRef.current.canvas.width,contextRef.current.canvas.height);
            setIsDrawing(false);
        }
    }

  return (
    <div className='flex h-screen relative'>
        <canvas 
            className="w-[97%] "
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            // onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
        >
    
        </canvas>
        <Draggable>
            <div className={`${drawerPanelOption==="vertical"?'h-[80%] flex flex-col justify-between w-10 place-items-center text-center':'w-[60%] h-[12] flex justify-between place-items-center'}  rounded border absolute right-0 m-2 bg-white`}>
                <div className={`flex ${drawerPanelOption==="vertical"?'flex-col  my-3':'flex-row '} gap-3 py-2 text-center items-center`}>
                    <button className={`cursor-move p-2 ${drawerPanelOption==="vertical"?'-mt-3':'ml-2'} rounded text-lg hover:bg-blue-500 hover:text-white`}>
                        <GrDrag/>
                    </button>

                    <button onClick={()=>{handleButtonClick('background')}} className={`cursor-pointer p-2 rounded text-lg hover:bg-blue-500 ${activeButton=="background" ? 'bg-blue-200' : ''} hover:text-white`}>
                        <TbBackground/>
                    </button>

                    <div className='relative'>
                        <button 
                        
                            ref={pencilButtonRef}
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="pencil" ? 'bg-blue-200' : ''} `}
                            onClick={() => { setToDraw(); toggleControls(); handleButtonClick("pencil") }}
                            aria-label="Pencil tool"
                        >
                        <IoPencil />
                        </button>
                        {showControls && (
                            <div className={`absolute ${drawerPanelOption==="vertical"?'-left-32 -top-4':'-left-11 top-11'}  p-1 rounded bg-slate-400 w-32`}>
                                <div>
                                    <input 
                                        type="color" 
                                        name="pen_color" 
                                        id="pen_color" 
                                        value={penColor}
                                        onChange={handleColorChange}
                                        className="w-full rounded outline-none bg-none fill-none"
                                    />
                                </div>
                                <div className='flex mt-2'>
                                    <input 
                                        type="range" 
                                        min={1} 
                                        max={20}
                                        name="pen_size" 
                                        id="pen_size" 
                                        value={penSize}
                                        onChange={handleSizeChange}
                                        className="w-full"
                                    />
                                    <span className='text-sm'>{penSize}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button 
                        className={`cursor-pointer text-lg p-2 rounded  hover:bg-blue-500 hover:text-white ${activeButton=="eraser" ? 'bg-blue-200' : ''}`}
                        onClick={() => { setToErase(); setShowControls(false); handleButtonClick("eraser") }}
                        aria-label="Eraser tool"
                    >
                        <BsEraser />
                    </button>
                    <button 
                        className={`cursor-pointer text-lg p-2 rounded hover:bg-blue-500 ${activeButton=="clear_canva" ? 'bg-blue-200' : ''} hover:text-white`}
                        onClick={() => { clearCanvas(); handleButtonClick("clear_canva") }}
                        aria-label="Eraser tool"
                    >
                        <BsFillEraserFill />
                    </button>
                </div>
                <div>
                    <button onClick={()=>{handleButtonClick("settings")}} className={`${activeButton=="settings" ? 'bg-blue-200' : ''} ${drawerPanelOption==="vertical"?'mb-2':'mr-3'} left-0 cursor-pointer text-lg p-2 rounded hover:bg-blue-500`}>
                        <IoSettings/>
                    </button>
                </div>
            </div>
        </Draggable>
    </div>
        
  )
}

export default DrawCanvas
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { BsEraser, BsFillEraserFill, BsSteam } from 'react-icons/bs';
import { GrDrag } from 'react-icons/gr';
import { IoPencil, IoSettings } from 'react-icons/io5';
import { TbBackground } from 'react-icons/tb';

interface DrawCanvasProps{
    initialColor?: string;
    initialBackgroundColor?:string;
    initialLineWidth?: number;
}
const DrawCanvas = ({initialColor='black',initialBackgroundColor="#FFFFFF",initialLineWidth=4}:DrawCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const pencilButtonRef = useRef<HTMLButtonElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [penColor, setPenColor] = useState<string>(initialColor);
    const [backgroundColor, setBackgroundColor] = useState<string>(initialBackgroundColor);
    const [penSize, setPenSize] = useState(initialLineWidth);
    const [showControls, setShowControls] = useState(false);
    const [backgroundControl, setBackgroundControl] = useState(false);
    const [controlsPosition, setControlsPosition] = useState({ top: 0, left: 0 });
    const [drawerPanelOption, setDrawerPanelOption] = useState<string>("vertical");
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    const handleButtonClick = (buttonName:string) => {
        setActiveButton(buttonName);
        if (buttonName !="settings") {
            setShowSettingsDropdown(false);
        }

        if (buttonName !="background") {
            setBackgroundControl(false);
            
        }
      };


    const toggleControls = () => {
        setShowControls(!showControls);
    };
    const toggleBackroundControls = () => {
        if (pencilButtonRef.current) {
            const rect = pencilButtonRef.current.getBoundingClientRect();
            setControlsPosition({
                top: rect.top - 10,
                left: rect.left - 120, // Adjust this value to position the controls correctly
            });
        }
        setBackgroundControl(!backgroundControl);
        setShowControls(false)
    };



    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setBackgroundColor(e.target.value);
    }

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
        setShowSettingsDropdown(false);
        setBackgroundControl(false);
        setShowControls(false)

       
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
    const toggleSettingsDropdown = () => {
        setShowSettingsDropdown(!showSettingsDropdown);
    }

  return (
    <div className={`flex h-screen relative`}  style={{ backgroundColor: backgroundColor }}>
        <canvas 
            className={`w-[97%] `}
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
        <Draggable key={"settings"} cancel=".non-draggable">
            <div className={`${drawerPanelOption==="vertical"?'h-[80%] flex flex-col justify-between w-10 place-items-center text-center':'w-[60%] h-[12] flex justify-between place-items-center'}  rounded border absolute right-0 m-2 bg-white`}>
                <div className={`flex ${drawerPanelOption==="vertical"?'flex-col  my-3':'flex-row '} gap-3 py-2 text-center items-center`}>
                    <button className={`cursor-move p-2 ${drawerPanelOption==="vertical"?'-mt-3':'ml-2'} rounded text-lg hover:bg-blue-500 hover:text-white`}>
                        <GrDrag/>
                    </button>
                    <div className="relative">
                        <button onClick={()=>{ toggleBackroundControls();handleButtonClick('background')}} className={`cursor-pointer p-2 rounded text-lg hover:bg-blue-500 ${activeButton=="background" ? 'bg-blue-200' : ''} hover:text-white`}>
                            <TbBackground/>
                        </button>
                        {backgroundControl && (
                            <div className={`absolute ${drawerPanelOption==="vertical"?'right-10 -top-0.5':'-left-11 top-11'}  p-1 rounded bg-blue-200 w-32`}>
                                <div>
                                <small className='font-bold text-xs'>Background Color</small>
                                    <input 
                                        type="color" 
                                        name="background_color" 
                                        id="background_color" 
                                        value={backgroundColor}
                                        onChange={handleBackgroundColorChange}
                                        className="non-draggable w-full rounded outline-none bg-none fill-none"
                                    />
                                </div>                                
                            </div>
                        )}
                    </div>

                    <div className='relative'>
                        <button                         
                            ref={pencilButtonRef}
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="pencil" ? 'bg-blue-200' : ''} `}
                            onClick={() => { setToDraw(); toggleControls();setBackgroundControl(false);setShowSettingsDropdown(false); handleButtonClick("pencil") }}
                            aria-label="Pencil tool"
                        >
                        <IoPencil />
                        </button>
                        {activeButton=="pencil" && (
                            <div className='non-draggable -mt-1.5 h-2.5 cursor-pointer '> 
                                <input 
                                    type="range" 
                                    min={1} 
                                    max={20}
                                    name="pen_size" 
                                    id="pen_size" 
                                    value={penSize}
                                    onChange={handleSizeChange}
                                    className={`non-draggable custom-range ${drawerPanelOption==="vertical"?'w-full':'w-9'} `}
                                />
                            </div>
                        )}
                        {showControls && (
                            <div className={`absolute ${drawerPanelOption==="vertical"?'right-10 -top-0.5 w-14':'top-[3rem] -right-0.5 w-10'} p-1 rounded bg-blue-200`}>
                                <div className='text-left'>
                                    <input 
                                        type="color" 
                                        name="pen_color" 
                                        id="pen_color" 
                                        value={penColor}
                                        onChange={handleColorChange}
                                        className={`non-draggable rounded outline-none bg-none ${drawerPanelOption==="vertical"?'h-6.5 w-full':'h-6.5 w-full'}`}
                                    />
                                </div>
                                <div className='text-[8px] font-bold'>Size {penSize}</div>
                            </div>
                        )}
                    </div>
                    <div>
                    <button 
                        className={`cursor-pointer text-lg p-2 rounded  hover:bg-blue-500 hover:text-white ${activeButton=="eraser" ? 'bg-blue-200' : ''}`}
                        onClick={() => { setToErase(); setShowControls(false);setShowSettingsDropdown(false); handleButtonClick("eraser") }}
                        aria-label="Eraser tool"
                    >
                        <BsEraser />
                    </button>
                    {activeButton=="eraser" && (
                        <div className='non-draggable -mt-1.5 h-2.5 cursor-pointer '> 
                         <input 
                            type="range" 
                            min={1} 
                            max={20}
                            name="pen_size" 
                            id="pen_size" 
                            value={penSize}
                            onChange={handleSizeChange}
                            className={`non-draggable custom-range ${drawerPanelOption==="vertical"?'w-full':'w-9'} `}
                        />
                        </div>
                    )}
                    </div>

                    <button 
                        className={`cursor-pointer text-lg p-2 rounded hover:bg-blue-500 ${activeButton=="clear_canva" ? 'bg-blue-200' : ''} hover:text-white`}
                        onClick={() => { clearCanvas(); handleButtonClick("clear_canva") }}
                        aria-label="Eraser tool"
                    >
                        <BsFillEraserFill />
                    </button>
                </div>
                <div className='relative'>
                    <button onClick={() => { toggleSettingsDropdown(); handleButtonClick("settings") }} className={`${activeButton === "settings" ? 'bg-blue-200' : ''} ${drawerPanelOption === "vertical" ? 'mb-2' : 'mr-3'} left-0 cursor-pointer text-lg p-2 rounded hover:bg-blue-500`}>
                        <IoSettings />
                    </button>
                    {showSettingsDropdown && (
                        
                        <div className={`non-draggable absolute ${drawerPanelOption==="vertical"?'right-10 -top-10  w-48':'w-[200px] right-0'} mt-2 text-center  rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
                            <div className='font-semibold p-2 border-b-1'>Settings </div>
                            <hr />
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button className="w-[100%] block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Option 1</button>
                                <button className="w-[100%] block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Option 2</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Draggable>
    </div>
        
  )
}

export default DrawCanvas
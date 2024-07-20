import React, { createElement, useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { BsArrowDownCircle, BsCloudDownloadFill, BsEraser, BsFillEraserFill } from 'react-icons/bs';
import { GrDrag } from 'react-icons/gr';
import { IoAddCircle, IoImage, IoPencil, IoSettings, IoSquare, IoTextSharp, IoTriangle } from 'react-icons/io5';
import { TbBackground } from 'react-icons/tb';
import CursorCircle from './CursorCircle';
import { DrawCanvasProps } from '../Types';


const shapes = [<IoTriangle key="triangle" />, <IoAddCircle key="addCircle" />, <IoSquare key="square" />];

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}




const DrawCanvas = ({canvasWindowScroll=false,initialPenColor='#000000',initialBackgroundColor="#FFFFFF",initialLineWidth=2}:DrawCanvasProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const [windowScroll, setWindowScroll]  = useState<boolean>(canvasWindowScroll);
    const [gridBackgroud, setGridBackground] = useState<boolean>(false);
    const pencilButtonRef = useRef<HTMLButtonElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [activeButton, setActiveButton] = useState<string | null>(null);
    const [penColor, setPenColor] = useState<string>(initialPenColor);
    const [backgroundColor, setBackgroundColor] = useState<string>(initialBackgroundColor);
    const [penSize, setPenSize] = useState(initialLineWidth);
    const [showControls, setShowControls] = useState(false);
    const [backgroundControl, setBackgroundControl] = useState(false);
    const [drawerPanelOption, setDrawerPanelOption] = useState<string>("vertical");
    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPositionRef = useRef<{x: number, y: number} | null>(null);
    const isScrollingRef = useRef(false);
    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [shuffledShapes, setShuffledShapes] = useState<JSX.Element[]>([]);
  


    useEffect(() => {
      const shuffled = shuffleArray([...shapes]);
      setShuffledShapes(shuffled);
  
      const interval = setInterval(() => {
        setCurrentShapeIndex((prevIndex) => (prevIndex + 1) % shuffled.length);
      }, 300); // Change the interval time as needed (1000ms = 1s)
  
      return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);
    
  
    const handleButtonClick = (buttonName:string) => {
        setActiveButton(buttonName);
        if (buttonName !="settings") {
            setShowSettingsDropdown(false);
        }
        if (buttonName ==="pencil") {
            setIsDrawing(false);
        }

        if (buttonName !="background") {
            // setBackgroundControl(false);
            
        }
        if (buttonName ==="background") {
            setBackgroundControl(true);
            
        }
        if (buttonName !="shape_tools") {
            setBackgroundControl(false);
            // setShowControls(!showControls);
            
        }
        if (buttonName ==="shape_tools") {
        
            // setShowControls(!showControls);
            
        }
      };


    const toggleControls = () => {
        setShowControls(!showControls);
    };

    const toggleBackroundControls = () => {
        console.log(backgroundColor)
        setBackgroundControl(!backgroundControl);
        console.log(backgroundControl)
        setShowControls(false)
    };



    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setBackgroundColor(e.target.value);
    }
    const handleSetWindowScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWindowScroll(e.target.checked);

        console.log(e.target.checked)
    };


    const handleSetGridBackground = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGridBackground(e.target.checked);

        console.log(e.target.checked)
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPenColor(e.target.value);
        if (contextRef.current && !isErasing) {
            contextRef.current.strokeStyle = e.target.value;
        }
    }


    const handlePenSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value);
        setPenSize(newSize);
        if (contextRef.current) {
            contextRef.current.lineWidth = newSize;
        }
    }
    
    const initializeCanvas = useCallback(()=>{
        const canvas = canvasRef.current;
        if (canvas) {            
            canvas.width = (window.innerWidth );  // Set a larger initial width
            canvas.height = (window.innerHeight);  // Set a larger initial height
            const context = canvas.getContext("2d");
            if (context) {
                
                context.lineCap = "round";
                context.strokeStyle = initialPenColor;
                context.lineWidth = initialLineWidth;
            }
            contextRef.current = context;
        }
    },[initialPenColor,initialLineWidth])


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
            // window.removeEventListener('resize',handleResize);
            document.body.removeEventListener('touchstart', preventDefault);
            document.body.removeEventListener('touchmove', preventDefault);
        };
    
    }, [initializeCanvas]);

    
    const scrollIfNeeded = (x: number, y: number) => {
        if (containerRef.current) {
            const container = containerRef.current;
            const buffer = 100; // pixels from edge to start scrolling
            let scrolled = false;

            if (y > container.scrollTop + container.clientHeight - buffer) {
                container.scrollTop = y - container.clientHeight + buffer;
                scrolled = true;
            }

            if (x > container.scrollLeft + container.clientWidth - buffer) {
                container.scrollLeft = x - container.clientWidth + buffer;
                scrolled = true;
            }

            if (scrolled) {
                isScrollingRef.current = true;
                setTimeout(() => {
                    isScrollingRef.current = false;
                }, 100); // Adjust this delay if needed
            }
        }
    };
    const resizeCanvasIfNeeded = (x: number, y: number) => {
        const canvas = canvasRef.current;
        if (canvas && contextRef.current) {
            const context = contextRef.current;
            let needResize = false;
            let newWidth = canvas.width;
            let newHeight = canvas.height;
    
            if (x >= (canvas.width - 100)) {
                newWidth = canvas.width + 100;
                needResize = true;
            }
            if (y >= (canvas.height - 100)) {
                newHeight = canvas.height + 100;
                needResize = true;
            }
    
            if (needResize) {
                // Save the current canvas state
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
                // Resize the canvas
                canvas.width = newWidth;
                canvas.height = newHeight;
    
                // Restore the canvas state
                context.putImageData(imageData, 0, 0);
    
                // Reset the context properties as they get cleared after resizing
                context.lineCap = "round";
                context.strokeStyle = penColor;
                context.lineWidth = penSize;
                context.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
            }
        }
    };
    const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return { offsetX: 0, offsetY: 0 };

        const rect = canvas.getBoundingClientRect();
        if ('touches' in event) {
            const touch = event.touches[0];
            return {
                offsetX: touch.clientX - rect.left + container.scrollLeft,
                offsetY: touch.clientY - rect.top + container.scrollTop
            };
        } else {
            return {
                offsetX: event.clientX - rect.left + container.scrollLeft,
                offsetY: event.clientY - rect.top + container.scrollTop
            };
        }
    };

    const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        console.log("Draw")
        if (!isDrawing){
            return;
        } 
        
        document.addEventListener("mousemove",(e)=>{
            // if (canvasRef.current) {            
            //     canvasRef.current.style.cursor ="move"
            // }
            const x = e.clientX;
            const y = e.clientY;
            const xOffsetX = e.offsetX
            const yOffsetY = e.offsetY
            console.log("Mouse:",x,y)
            console.log("Mouse Offset:",xOffsetX,yOffsetY)
        })

        const { offsetX, offsetY } = getCoordinates(event);
        if (contextRef.current) {
            
            if (lastPositionRef.current && !isScrollingRef.current) {
                contextRef.current.beginPath();
                contextRef.current.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
                contextRef.current.lineTo(offsetX, offsetY);
                contextRef.current.imageSmoothingQuality = "high";
                contextRef.current.stroke();
                lastPositionRef.current = { x: offsetX, y: offsetY }
                console.log(lastPositionRef.current);
                
                //This part enables you to extend your drawing when it get to the vertical and horizontal end 
                // and automatically scrolls down or right while drawing
                if (windowScroll) {                    
                    resizeCanvasIfNeeded(offsetX, offsetY);
                    scrollIfNeeded(offsetX, offsetY);
                }
            }
           
        }
    }, [isDrawing, getCoordinates, resizeCanvasIfNeeded, scrollIfNeeded]);


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
  

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
       
        event.preventDefault();
        const { offsetX, offsetY } = getCoordinates(event);
        
        if (contextRef.current) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
        }

        lastPositionRef.current = { x: offsetX, y: offsetY };
        setIsDrawing(true);
        setShowSettingsDropdown(false);
        setBackgroundControl(false);
        setShowControls(false);

        console.log(isDrawing)
    };


    const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (isDrawing && contextRef.current) {
            contextRef.current.closePath();
            setIsDrawing(false);
        }
        lastPositionRef.current = null;
    };

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

    const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
        e.preventDefault(); // Prevent default behavior
    };
      
    const handleTouchMove = (e: React.TouchEvent<HTMLInputElement>) => {
        e.preventDefault(); // Prevent default behavior
        const touch = e.touches[0];
        const target = e.currentTarget as HTMLInputElement;
    
    // Calculate new value
        const rect = target.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const newValue = ((touchX / rect.width) * (Number(target.max) - Number(target.min))) + Number(target.min);
        
        // Set new value
        target.value = Math.min(Math.max(newValue, Number(target.min)), Number(target.max)).toString();
        
        // Trigger change event
        handlePenSizeChange({
            target: { value: target.value }
        } as React.ChangeEvent<HTMLInputElement>);
    };
      
    const handleTouchEnd = (e: React.TouchEvent<HTMLInputElement>) => {
        e.preventDefault(); // Prevent default behavior
    };
      
 

  return (
    <div className={`flex relative"`} style={{ backgroundColor: backgroundColor }}>
        <CursorCircle shape={activeButton}/>
    <div className='absolute'>
        <button  className='text-white bg-black rounded p-1 m-3'>
        <BsCloudDownloadFill className='text-xl '/>
        </button>
    </div>
        
   <div ref={containerRef} className={`h-screen overflow-auto`}>
        <canvas 
            className={`${windowScroll?'min-w-full min-h-full':''}`}
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
            <div className={`${drawerPanelOption==="vertical"?'top-0 h-[65%] flex flex-col justify-between w-10 place-items-center text-center':'w-[55%] h-[12] flex justify-between place-items-center'} rounded border absolute right-0 m-2 bg-white`}>
                <div className={`flex ${drawerPanelOption==="vertical"?'flex-col  my-3':'flex-row '} gap-3 py-1 text-center items-center`}>
                    <button className={`cursor-move p-2 ${drawerPanelOption==="vertical"?'-mt-3':'ml-2'} rounded text-lg hover:bg-blue-500 hover:text-white`}>
                        <GrDrag/>
                    </button>
                    <div className="relative">
                        <button 
                        onClick={()=>{ setBackgroundControl(!backgroundControl);handleButtonClick('background')}} 
                        onTouchStart={()=>{ toggleBackroundControls();handleButtonClick('background')}} 
                        className={`cursor-pointer p-2 rounded text-lg hover:bg-blue-500 ${activeButton=="background" ? 'bg-blue-200' : ''} hover:text-white`}>
                            <TbBackground/>
                        </button>
                        {activeButton=="background"  && (
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
                                <button className="flex justify-between place-items-center w-[100%] px-2 py-1 text-sm mt-2 text-gray-700 bg-white rounded-sm hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                <label htmlFor='window_scroll'>Grid</label>
                                <input type="checkbox" onChange={handleSetGridBackground} name="window_scroll" id="window_scroll" />
                                </button>                               
                            </div>
                        )}
                    </div>

                    <div className='relative'>
                        <button                         
                            ref={pencilButtonRef}
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="pencil" ? 'bg-blue-200' : ''} `}
                            onTouchStart={() => { setToDraw(); toggleControls();setBackgroundControl(false);setShowSettingsDropdown(false); handleButtonClick("pencil") }}
                            onClick={() => { setToDraw(); toggleControls();setBackgroundControl(false);setShowSettingsDropdown(false); handleButtonClick("pencil") }}
                            aria-label="Pencil tool"
                        >
                        <IoPencil />
                        </button>
                        {activeButton==="pencil" && (
                            <div className='non-draggable -mt-1.5 h-2.5 cursor-pointer '> 
                                <input 
                                    type="range" 
                                    min={1} 
                                    max={20}
                                    name="pen_size" 
                                    id="pen_size" 
                                    value={penSize}
                                    onChange={handlePenSizeChange}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
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
                    <div className='relative'>
                        <button                         
                           
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="shape_tools" ? 'bg-blue-200' : ''} `}
                            onTouchStart={() => {handleButtonClick("shape_tools") }}
                            onClick={() => {handleButtonClick("shape_tools") }}
                            aria-label="Shape tool"
                        >
                           {shuffledShapes[currentShapeIndex]}
                        </button>
                    </div>
                    <div className='relative'>
                        <button                         
                           
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="image_tools" ? 'bg-blue-200' : ''} `}
                            onTouchStart={() => {handleButtonClick("image_tools") }}
                            onClick={() => {handleButtonClick("image_tools") }}
                            aria-label="Image tools"
                        >
                           <IoImage/>
                        </button>
                    </div>
                    <div className='relative'>
                        <button                         
                           
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-blue-500 hover:text-white p-2 ${activeButton==="text_area" ? 'bg-blue-200' : ''} `}
                            onTouchStart={() => {handleButtonClick("text_area") }}
                            onClick={() => {handleButtonClick("text_area") }}
                            aria-label="Text area"
                        >
                           <IoTextSharp/>
                        </button>
                    </div>

                    
                </div>
                


                <div className={`flex ${drawerPanelOption==="vertical"?'flex-col':''}  gap-5`}>
                    <div>
                        <button 
                            className={`cursor-pointer text-lg p-2 rounded  hover:bg-blue-500 hover:text-white ${activeButton=="eraser" ? 'bg-blue-200' : ''}`}
                            onClick={() => { setToErase(); setShowControls(false);setShowSettingsDropdown(false); handleButtonClick("eraser") }}
                            onTouchStart={() => { setToErase(); setShowControls(false);setShowSettingsDropdown(false); handleButtonClick("eraser") }}
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
                                onChange={handlePenSizeChange}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className={`non-draggable custom-range ${drawerPanelOption==="vertical"?'w-full':'w-9'} `}
                            />
                            </div>
                        )}
                    </div>

                    <div>
                        <button 
                            className={`cursor-pointer text-lg p-2 rounded hover:bg-blue-500 ${activeButton=="clear_canva" ? 'bg-blue-200' : ''} hover:text-white`}
                            onClick={() => { clearCanvas(); handleButtonClick("clear_canva") }}
                            onTouchStart={() => { clearCanvas(); handleButtonClick("clear_canva") }}
                            aria-label="Eraser tool"
                        >
                            <BsFillEraserFill />
                        </button>
                    </div>
                    <div className='relative'>
                        <button
                            onClick={() => { toggleSettingsDropdown(); handleButtonClick("settings") }}
                            className={`${activeButton === "settings" ? 'bg-blue-200' : ''} ${drawerPanelOption === "vertical" ? 'mb-2' : 'mr-3'} left-0 cursor-pointer text-lg p-2 rounded hover:bg-blue-500`}
                        >
                            <IoSettings />
                        </button>
                        {showSettingsDropdown && (
                            <div className={`non-draggable absolute ${drawerPanelOption === "vertical" ? 'right-10 -top-10 w-48' : 'w-[200px] right-0'} mt-2 text-center rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
                            <div className='font-semibold p-2 border-b-1'>Settings</div>
                            <hr />
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button className="flex justify-between place-items-center w-[100%] px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                <label htmlFor='window_scroll'>Window scroll</label>
                                <input type="checkbox" onChange={handleSetWindowScroll} name="window_scroll" id="window_scroll" />
                                </button>
                                </div>
                            </div>
                        )}
                    </div>
  
                </div>
            </div>
        </Draggable>
    </div>
    </div>
        
  )
}

export default DrawCanvas
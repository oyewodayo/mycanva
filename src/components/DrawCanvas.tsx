import React, { useCallback, useEffect, useRef, useState } from 'react'
import Draggable from 'react-draggable';
import { BsCloudDownloadFill, BsEraser, BsFillEraserFill } from 'react-icons/bs';
import { GrDrag } from 'react-icons/gr';
import { IoAddCircle, IoImage, IoPencil, IoSettings, IoSquare, IoSquareOutline, IoTextSharp, IoTriangle, IoTriangleOutline } from 'react-icons/io5';
import { TbBackground } from 'react-icons/tb';
import CursorCircle from './CursorCircle';
import { DrawCanvasProps } from '../Types';
import { BiCircle, BiRectangle, BiRuler, BiSolidCircle, BiSolidRectangle, BiSolidStar, BiStar } from 'react-icons/bi';
import { MdOutlineHorizontalRule } from 'react-icons/md';


const shapes = [<IoTriangle key="triangle" className='z-0' />, <IoAddCircle key="addCircle" className='z-0' />, <IoSquare key="square" className='z-0' />];

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
    const [windowScroll, setWindowScroll] = useState<boolean>(canvasWindowScroll);
    const [gridBackground, setGridBackground] = useState<boolean>(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);
    const [activeButton, setActiveButton] = useState<string>("pencil");
    const [penColor, setPenColor] = useState<string>(initialPenColor);
    const [backgroundColor, setBackgroundColor] = useState<string>(initialBackgroundColor);
    const [penSize, setPenSize] = useState(initialLineWidth);
    const [penControl, setPenControl] = useState(false);
    const [backgroundControl, setBackgroundControl] = useState(false);
    const [drawerPanelOption, setDrawerPanelOption] = useState<string>("vertical");
    const [currentShape, setCurrentShape] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const lastPositionRef = useRef<{x: number, y: number} | null>(null);
    const isScrollingRef = useRef(false);
    
    const [currentShapeIndex, setCurrentShapeIndex] = useState(0);
    const [shuffledShapes, setShuffledShapes] = useState<JSX.Element[]>([]);

    const pencilButtonRef = useRef<HTMLButtonElement | null>(null);

    const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
   
    const [coordinates, setCoordinate] = useState<object>({x:0,y:0,offsetX:0,offsetY:0});
    const [shapeControl, setShapeControl] = useState(false);
  


    useEffect(() => {
        const shuffled = shuffleArray([...shapes]);
        setShuffledShapes(shuffled);

        const interval = setInterval(() => {
            setCurrentShapeIndex((prevIndex) => (prevIndex + 1) % shuffled.length);
        }, 300);

        return () => clearInterval(interval);
    }, []);
    
  
    const handleButtonClick = (buttonName: string) => {
        setActiveButton(buttonName);
        setIsDrawing(false);
        setIsErasing(false);

        if (buttonName === "pencil") {
            setToDraw();
            setShapeControl(false);
        } else if (buttonName === "eraser") {
            setToErase();
            setShowSettingsDropdown(false)
        } else if (buttonName === "image_tools") {
            setShapeControl(false);
            setShowSettingsDropdown(false)
        } else if (buttonName === "settings") {
            setShapeControl(false);
        } else if (buttonName === "shape_tools") {
            setShapeControl(!shapeControl);
            setShowSettingsDropdown(false)
        } else if (buttonName.includes("triangle") || buttonName.includes("square") || 
                   buttonName.includes("rectangle") || buttonName.includes("circle") || 
                   buttonName.includes("line") || 
                   buttonName.includes("star")) {
            setCurrentShape(buttonName);
            setShapeControl(false);
            setShowSettingsDropdown(false)
        }
        setBackgroundControl(buttonName === "background");
        setPenControl(buttonName === "pencil");
    };


    const togglePenControl = () => {
        setPenControl(!penControl);
    };


    const toggleBackroundControls = () => {
      
        setBackgroundControl(!backgroundControl);
        console.log(!backgroundControl)
        setPenControl(false)
    };



    const handleBackgroundColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        setBackgroundColor(e.target.value);
    }

    const handleSetWindowScroll = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWindowScroll(e.target.checked);
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
        console.log(newSize)
        setPenSize(newSize);
        if (contextRef.current) {
            contextRef.current.lineWidth = newSize;
        }
    }
    
    const initializeCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;  // Set a larger initial width
            canvas.height = window.innerWidth;  // Set a larger initial height
            const context = canvas.getContext("2d");
            if (context) {
                context.lineCap = "round";
                context.strokeStyle = initialPenColor;
                context.lineWidth = initialLineWidth;
            }
            contextRef.current = context;
        }
    }, [initialPenColor, initialLineWidth]);
    

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
            setCoordinate({x:touch.clientX,y:touch.clientY})
            return {
                offsetX: touch.clientX - rect.left + container.scrollLeft,
                offsetY: touch.clientY - rect.top + container.scrollTop
            };
        } else {
            setCoordinate({x:event.clientX,y:event.clientY})
            
            return {
                offsetX: event.clientX - rect.left + container.scrollLeft,
                offsetY: event.clientY - rect.top + container.scrollTop
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
  

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        const { offsetX, offsetY } = getCoordinates(event);
    
        if (contextRef.current) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
        }
    
        lastPositionRef.current = { x: offsetX, y: offsetY };
        setIsDrawing(true);
        setShapeControl(false);
        setShowSettingsDropdown(false)
    };

    const stopDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (isDrawing && contextRef.current) {
            contextRef.current.closePath();
            if (currentShape) {
                const { offsetX, offsetY } = getCoordinates(event);
                drawShape(lastPositionRef.current!.x, lastPositionRef.current!.y, offsetX, offsetY);
            }
            setIsDrawing(false);
        }
        lastPositionRef.current = null;
    };


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
      

    const drawGrid = ()=>{
        const canvas = contextRef.current;
        for (let index = 5; index <= 605; index = index+6) {
          
            if (canvas) {
                canvas?.moveTo(index, 5)
            canvas?.lineTo(index, window.innerWidth)

            canvas?.moveTo(5, index)
            canvas?.lineTo(window.innerWidth, index)

            canvas.strokeStyle = "#F0F0F0";
            canvas?.stroke();
            }
            
        }

        canvas?.beginPath()

        for (let index = 5; index <= window.innerWidth; index = index+30) {
            if (canvas) {
                canvas?.moveTo(index, 5)
                canvas?.lineTo(index, window.innerWidth)

                canvas?.moveTo(5, index)
                canvas?.lineTo(window.innerWidth, index)

                canvas.strokeStyle = "#c0c0c0";
                canvas?.stroke();
            }
            
        }
    }

    // drawGrid()

    const drawShape = useCallback((startX: number, startY: number, endX: number, endY: number) => {
        
        if (!currentShape || !contextRef.current) return;

            const ctx = contextRef.current;
            ctx.beginPath();

            const width = endX - startX;
            const height = endY - startY;

            switch (currentShape) {
            case 'line':
            // For pencil, we'll draw a line from the start point to the end point
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            break;
            case 'triangle':
            case 'triangle_outline':
                ctx.moveTo(startX + width / 2, startY);
                ctx.lineTo(startX, endY);
                ctx.lineTo(endX, endY);
                ctx.closePath();
                break;
            case 'square_fill':
            case 'square_stroke':
            case 'rectangle_fill':
            case 'rectangle_stroke':
                ctx.rect(startX, startY, width, height);
                break;
            case 'circle_stroke':
            case 'circle_fill':
                const radius = Math.min(Math.abs(width), Math.abs(height)) / 2;
                ctx.arc(startX + width / 2, startY + height / 2, radius, 0, 2 * Math.PI);
                break;
            case 'star':
                drawStar(ctx, startX + width / 2, startY + height / 2, 5, Math.min(Math.abs(width), Math.abs(height)) / 2, Math.min(Math.abs(width), Math.abs(height)) / 4);
                break;
        }
    
        if (currentShape.includes('fill')) {
            ctx.fill();
            ctx.fillStyle= penColor;
        } else {
            ctx.stroke();
        }
    }, [currentShape]);


    
    const draw = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (!isDrawing) return;
    
        const { offsetX, offsetY } = getCoordinates(event);
        if (contextRef.current && lastPositionRef.current) {
            if (!currentShape) {
                // Freehand drawing
                contextRef.current.lineTo(offsetX, offsetY);
                contextRef.current.stroke();
            }
        }
    }, [isDrawing, currentShape]);

    
    const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        let step = Math.PI / spikes;
    
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
    
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener('click', drawShape as any);
        }
        return () => {
            if (canvas) {
                canvas.removeEventListener('click', drawShape as any);
            }
        };
    }, [drawShape]);

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
    
    /*
        n= 2 will draw a poligon
        Addjusting the n will draw different shapes
        n= 1 line
        //Poligon
        inset = 1 and n = 0.5 represent 1 side
        number of sides = n*2
        Triangle: inset= 1, n=1.5
        square: inset= 1, n=2
        pentagon: inset= 1, n=2.5
        //Start 
        inset = 0.5 and n = number of sides of star
        
    */

//    drawShape(100,0.5,6)
 

  return (
    <div className={`flex relative"`} style={{ backgroundColor: backgroundColor }}>
        <CursorCircle shape={activeButton}/>
    <div className='absolute'>
        <button  className='text-white bg-black rounded p-1 my-5 mx-3'>
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
            <div className={`${drawerPanelOption==="vertical"?'top-12 h-[65%] right-12 flex flex-col justify-between w-10 place-items-center text-center':'lg:w-[45%] md:w-[55%] sm:w-[100vw] w-[100vw] h-[12] flex justify-between place-items-center top-1 left-10'} rounded border absolute m-2 bg-white`}>
                <button className={`cursor-move p-2 ${drawerPanelOption==="vertical"?'':'ml-2'} rounded text-lg hover:bg-black hover:text-white`}>
                    <GrDrag/>
                </button>
                <div className={`flex ${drawerPanelOption==="vertical"?'flex-col':'flex-row'} gap-3 py-1 text-center items-center`}>
                   
                    <div className="relative">
                        <button 
                        onClick={()=>{ toggleBackroundControls();handleButtonClick('background')}} 
                        onTouchStart={()=>{ toggleBackroundControls();handleButtonClick('background')}} 
                        className={`cursor-pointer p-2 rounded text-lg hover:bg-black hover:text-white ${activeButton=="background" ? 'bg-black/60 text-white' : ''}`}>
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
                                <button className="flex justify-between place-items-center w-[100%] px-2 py-1 text-sm mt-2 text-gray-700 bg-white rounded-sm hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                                <label htmlFor='window_scroll'>Grid</label>
                                <input type="checkbox" onChange={handleSetGridBackground} name="window_scroll" id="window_scroll" />
                                </button>                               
                            </div>
                        )}
                    </div>
                        <div className={`${drawerPanelOption==="vertical"?"w-[100%] text-center":"h-[100%] text-center"}`}>
                        <input 
                            type="color" 
                            name="pen_color" 
                            id="pen_color" 
                            value={penColor}
                            onChange={handleColorChange}
                            className={`non-draggable rounded outline-none bg-none ${drawerPanelOption==="vertical"?'h-6.5 w-full':'h-6.5 w-full'}`}
                        />
                        </div>
                    <div className='relative'>
                        <button                         
                            ref={pencilButtonRef}
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-black hover:text-white p-2 ${activeButton==="pencil" ? 'bg-black/60 text-white' : ''} `}
                            onTouchStart={() => { setToDraw(); togglePenControl();setBackgroundControl(false);setShowSettingsDropdown(false); handleButtonClick("pencil") }}
                            onClick={() => { setToDraw(); togglePenControl();setBackgroundControl(false);setShowSettingsDropdown(false); handleButtonClick("pencil") }}
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

                    </div>
                    <div className='relative'>
                        <button                         
                           
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-black hover:text-white p-2 ${activeButton==="shape_tools" ? 'bg-black/60 text-white' : ''} `}
                            onTouchStart={() => {handleButtonClick("shape_tools") }}
                            onClick={() => {handleButtonClick("shape_tools") }}
                            aria-label="Shape tool"
                        >
                           {shuffledShapes[currentShapeIndex]}
                        </button>
                        {shapeControl && (
                            <div className={`absolute ${drawerPanelOption==="vertical"?'right-10 -top-0.5':'-left-11 top-11'}  p-1 rounded bg-blue-200 w-32`}>
                                <div>
                                    <small className='font-bold text-xs'>Shapes</small>
                                    <div className='grid grid-cols-3 gap-2 px-2'>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("triangle") }}
                                            onClick={() => {handleButtonClick("triangle") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <IoTriangle/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("triangle") }}
                                            onClick={() => {handleButtonClick("triangle") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <IoTriangleOutline/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("square_fill") }}
                                            onClick={() => {handleButtonClick("square_fill") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <IoSquare/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("square_stroke") }}
                                            onClick={() => {handleButtonClick("square_stroke") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <IoSquareOutline/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("rectangle_fill") }}
                                            onClick={() => {handleButtonClick("rectangle_fill") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiSolidRectangle/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("rectangle_stroke") }}
                                            onClick={() => {handleButtonClick("rectangle_stroke") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiRectangle/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("circle_stroke") }}
                                            onClick={() => {handleButtonClick("circle_stroke") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiCircle/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("circle_fill") }}
                                            onClick={() => {handleButtonClick("circle_fill") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiSolidCircle/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("star") }}
                                            onClick={() => {handleButtonClick("star") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiStar/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("star") }}
                                            onClick={() => {handleButtonClick("star") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <BiSolidStar/>
                                        </button>
                                        <button 
                                            onTouchStart={() => {handleButtonClick("line") }}
                                            onClick={() => {handleButtonClick("line") }}
                                            className={`text-2xl hover:bg-white flex justify-center p-1 rounded`}>
                                            <MdOutlineHorizontalRule/>
                                        </button>
                                    </div>
                                </div> 
                                                             
                            </div>
                        )}
                    </div>
                    <div className='relative'>
                        <button 
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-black hover:text-white p-2 ${activeButton==="image_tools" ? 'bg-blue-200' : ''} `}
                            onTouchStart={() => {handleButtonClick("image_tools") }}
                            onClick={() => {handleButtonClick("image_tools") }}
                            aria-label="Image tools"
                        >
                           <IoImage/>
                        </button>
                    </div>
                    <div className='relative'>
                        <button                         
                           
                            className={`cursor-pointer text-lg align-middle text-center rounded hover:bg-black hover:text-white p-2 ${activeButton==="text_area" ? 'bg-black/60 text-white' : ''} `}
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
                            className={`cursor-pointer text-lg p-2 rounded  hover:bg-black hover:text-white ${activeButton=="eraser" ? 'bg-black/60 text-white' : ''}`}
                            onClick={() => { setPenControl(false);setShowSettingsDropdown(false); handleButtonClick("eraser") }}
                            onTouchStart={() => { setPenControl(false);setShowSettingsDropdown(false); handleButtonClick("eraser") }}
                            aria-label="Eraser tool"
                        >
                            <BsEraser />
                        </button>
                        {activeButton=="eraser" && (
                            <div className='non-draggable -mt-1.5 h-2.5 cursor-pointer '> 
                            <input 
                                type="range" 
                                min={1} 
                                max={100}
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
                            className={`cursor-pointer text-lg p-2 rounded hover:bg-black hover:text-white ${activeButton=="clear_canva" ? 'bg-black/60 text-white' : ''} hover:text-white`}
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
                            onTouchStart={() => { toggleSettingsDropdown(); handleButtonClick("settings") }}
                            className={`${activeButton === "settings" ? 'bg-black/60 text-white' : ''} ${drawerPanelOption === "vertical" ? 'mb-2' : 'mr-3'} left-0 cursor-pointer text-lg p-2 rounded hover:bg-black hover:text-white`}
                        >
                            <IoSettings />
                        </button>
                        {showSettingsDropdown && (
                            <div className={`non-draggable absolute ${drawerPanelOption === "vertical" ? 'right-10 -top-10 w-32' : 'w-[200px] right-0'} text-sm mt-2 text-center rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
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
                <button onTouchStart={()=>{setDrawerPanelOption(drawerPanelOption=="vertical"?"horizontal":"vertical")}} onClick={()=>{setDrawerPanelOption(drawerPanelOption=="vertical"?"horizontal":"vertical")}} className={` ${drawerPanelOption==="vertical"?'w-10 h-3 -mb-4':'h-10 w-2.5 -mr-3 '} border-white border-[1px] rounded-sm bg-black`}></button> 
            </div>
           
        </Draggable>
    </div>
    </div>
        
  )
}

export default DrawCanvas
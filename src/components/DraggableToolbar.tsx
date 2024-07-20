import React from 'react'
import Draggable from 'react-draggable';
import { GrDrag } from 'react-icons/gr';
import { TbBackground } from 'react-icons/tb';
import { IoPencil, IoImage, IoTextSharp } from 'react-icons/io5';
import { BsEraser, BsFillEraserFill } from 'react-icons/bs';
import { IoSettings } from 'react-icons/io5';


const DraggableToolbar = ({drawerPanelOption,
    activeButton,
    handleButtonClick,
    backgroundColor,
    handleBackgroundColorChange,
    setToDraw,
    toggleControls,
    setBackgroundControl,
    setShowSettingsDropdown,
    penSize,
    handleSizeChange,
    penColor,
    handleColorChange,
    showControls,
    shuffledShapes,
    currentShapeIndex,
    setToErase,
    clearCanvas,
    toggleSettingsDropdown,
    showSettingsDropdown,
    handleSetWindowScroll,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd}) => {
  return (
    <Draggable key={"settings"} cancel=".non-draggable">
    <div className={`${drawerPanelOption==="vertical"?'top-0 h-[65%] flex flex-col justify-between w-10 place-items-center text-center':'w-[55%] h-[12] flex justify-between place-items-center'}  rounded border absolute right-0 m-2 bg-white`}>
        <div className={`flex ${drawerPanelOption==="vertical"?'flex-col  my-3':'flex-row '} gap-3 py-2 text-center items-center`}>
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
                            onChange={handleSizeChange}
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
                        onChange={handleSizeChange}
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
                <button onClick={() => { toggleSettingsDropdown(); handleButtonClick("settings") }} className={`${activeButton === "settings" ? 'bg-blue-200' : ''} ${drawerPanelOption === "vertical" ? 'mb-2' : 'mr-3'} left-0 cursor-pointer text-lg p-2 rounded hover:bg-blue-500`}>
                    <IoSettings />
                </button>
                {showSettingsDropdown && (
                    
                    <div className={`non-draggable absolute ${drawerPanelOption==="vertical"?'right-10 -top-10  w-48':'w-[200px] right-0'} mt-2 text-center  rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5`}>
                        <div className='font-semibold p-2 border-b-1'>Settings </div>
                        <hr />
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <button className="flex justify-between place-items-center w-[100%] px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            <label htmlFor='window_scroll'>Window scroll</label>
                            <input type="checkbox" onChange={()=>{handleSetWindowScroll}} name="window_scroll" id="window_scroll" />
                            </button>
                            <button className="w-[100%] block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">Option 2</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
</Draggable>
  )
}

export default DraggableToolbar
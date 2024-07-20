import React, { useEffect, useState } from 'react'
import { ShapeButtonProps } from '../Types';
import { BsEraser } from 'react-icons/bs';

const CursorCircle: React.FC<{ shape: ShapeButtonProps['activeButton'] }> = ({ shape }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [offSet, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
            setOffset({ x: e.offsetX, y: e.offsetY });
            
        }

        window.addEventListener("mousemove", handleMouseMove);
        // window.removeEventListener("mousemove",handleMouseMove);
    }, [])

    // Uncomment this to let the info box move along with cursor
  
    // useEffect(() => {
    //     const animate = () => {
    //         requestAnimationFrame(animate);
    //         const circle = document.getElementById('cursor-circle');

    //         if (circle) {
    //             circle.style.transform = `translate(${position.x}px, ${position.y}px)`;

    //         }
    //     }

    //     animate()
    // }, [position])
    
   


    return (
        <div>
            {shape === 'eraser' ? (
                <div
                    id="cursor-circle"
                    className={`absolute h-[30px] w-[30px] flex justify-center -mt-8 -ml-2 align-middle place-items-center text-center rounded-full border-[1px]`}
                >
               
                </div>
            ) : (
                <div className='absolute p-3 bottom-0'>
                <div
                    id="cursor-circle"
                    className={`flex flex-col justify-center -top-8 w-50 h-[30px] px-2 align-middle place-items-center text-center rounded bg-black text-white text-sm pointer-events-none z-10`}
                >
                    <div className="text-[10px]">{`X: ${offSet.x}, Y: ${offSet.y}`}</div>
                    <div className={`text-[10px] ${shape===null?'':'-mt-1.5'} `}>{shape===null?'':shape?.charAt(0).toUpperCase().concat(shape.slice(1))}</div>
                </div>
            </div>
                // <div
                //     id="cursor-circle"
                //     className={`fixed ${window.innerWidth <= offSet.x + 100 ? '-left-20' : 'left-0'} flex flex-col justify-center -top-8 w-50 h-[30px] px-2 align-middle place-items-center text-center rounded-sm bg-[#f00] text-white text-sm pointer-events-none z-10`}
                // >
                //     <div className="text-[10px]">{`X: ${offSet.x}, Y: ${offSet.y}`}</div>
                //     <div className={`text-[10px] ${shape===null?'':'-mt-1.5'} `}>{shape===null?'':shape?.charAt(0).toUpperCase().concat(shape.slice(1))}</div>
                // </div>
            )}
            <div className='absolute p-3 bottom-0'>
                <div
                    id="cursor-circle"
                    className={`flex flex-col justify-center -top-8 w-50 h-[30px] px-2 align-middle place-items-center text-center rounded bg-black text-white text-sm pointer-events-none z-10`}
                >
                    <div className="text-[10px]">{`X: ${offSet.x}, Y: ${offSet.y}`}</div>
                    <div className={`text-[10px] ${shape===null?'':'-mt-1.5'} `}>{shape===null?'':shape?.charAt(0).toUpperCase().concat(shape.slice(1))}</div>
                </div>
            </div>
        </div>
    )
}

export default CursorCircle
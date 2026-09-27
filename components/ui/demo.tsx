'use client'

import { SpiralAnimation } from "@/components/ui/spiral-animation"
import { useState, useEffect } from 'react'

interface SpiralDemoProps {
  onEnter?: () => void;
  buttonText?: string;
  showClose?: boolean;
  onClose?: () => void;
}

const SpiralDemo = ({ onEnter, buttonText = "Enter", showClose = false, onClose }: SpiralDemoProps = {}) => {
  const [startVisible, setStartVisible] = useState(false)
  
  // Handle navigation to personal site or custom onEnter callback
  const handleAction = () => {
    if (onEnter) {
      onEnter()
    } else {
      window.location.href = "https://xubh.top/"
    }
  }
  
  // Fade in the start button after animation loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartVisible(true)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-50">
      {/* Spiral Animation */}
      <div className="absolute inset-0">
        <SpiralAnimation />
      </div>

      {showClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm transition-all"
        >
          Close Preview ✕
        </button>
      )}
      
      {/* Simple Elegant Text Button with Pulsing Effect */}
      <div 
        className={`
          absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10
          transition-all duration-1500 ease-out
          ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <button 
          onClick={handleAction}
          className="
            text-white text-2xl tracking-[0.2em] uppercase font-extralight
            transition-all duration-700
            hover:tracking-[0.3em] animate-pulse
          "
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

export { SpiralDemo }
export default SpiralDemo

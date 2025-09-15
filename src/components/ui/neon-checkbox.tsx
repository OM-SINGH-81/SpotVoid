"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface NeonCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onCheckedChange' | 'checked'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  color?: string;
}

const NeonCheckbox = React.forwardRef<HTMLInputElement, NeonCheckboxProps>(
  ({ className, checked, onCheckedChange, id, color, ...props }, ref) => {
    
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckedChange(event.target.checked);
    };

    const style = color ? {
        '--checkbox-primary': color,
        '--checkbox-primary-dark': color,
        '--checkbox-primary-light': color,
    } as React.CSSProperties : {};

    return (
      <label htmlFor={id} className={cn("neon-checkbox", className)} style={style}>
        <input 
            type="checkbox" 
            id={id} 
            checked={checked} 
            onChange={handleChange}
            ref={ref}
            {...props}
        />
        <div className="neon-checkbox__frame">
          <div className="neon-checkbox__box">
            <div className="neon-checkbox__check-container">
              <svg viewBox="0 0 24 24" className="neon-checkbox__check">
                <path d="M3,12.5l7,7L21,5"></path>
              </svg>
            </div>
            <div className="neon-checkbox__glow"></div>
            <div className="neon-checkbox__borders">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div className="neon-checkbox__effects">
            <div className="neon-checkbox__particles">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span>
            </div>
            <div className="neon-checkbox__rings">
              <div className="ring"></div>
              <div className="ring"></div>
              <div className="ring"></div>
            </div>
            <div className="neon-checkbox__sparks">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </label>
    );
  }
);
NeonCheckbox.displayName = "NeonCheckbox";

export { NeonCheckbox };

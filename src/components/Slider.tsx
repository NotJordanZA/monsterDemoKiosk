import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  showValue?: boolean;
  valueLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className = '',
  showValue = true,
  valueLabel = ''
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <label className="text-xl font-bold text-monster-white">
          {label}
        </label>
        {showValue && (
          <div className="text-2xl font-bold text-monster-green monster-glow px-4 py-2 bg-monster-dark rounded-lg border border-monster-green border-opacity-30">
            {value} {valueLabel}
          </div>
        )}
      </div>
      
      <div className="relative h-12 flex items-center">
        {/* Track */}
        <div className="w-full h-4 bg-monster-gray rounded-full border border-monster-light-gray relative">
          {/* Progress */}
          <div 
            className="h-full bg-gradient-to-r from-monster-green to-monster-green rounded-full monster-glow transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb indicator */}
          <div 
            className="absolute top-1/2 w-8 h-8 bg-monster-green rounded-full border-4 border-monster-dark monster-glow-strong transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 shadow-lg pointer-events-none"
            style={{ left: `${percentage}%` }}
          />
        </div>
        
        {/* Slider input - enlarged touch area */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-12 opacity-0 cursor-pointer z-10"
          style={{
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between mt-2 text-sm text-monster-silver">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

export default Slider;
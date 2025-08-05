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
        <label className="text-xl font-bold text-cyber-green matrix-text uppercase tracking-widest">
          [{label.replace(/\s/g, '_')}]
        </label>
        {showValue && (
          <div className="text-2xl font-bold text-cyber-cyan neon-glow-cyan px-4 py-2 bg-cyber-dark wireframe-border matrix-text">
            {value} [{valueLabel.toUpperCase()}]
          </div>
        )}
      </div>
      
      <div className="relative h-12 flex items-center">
        {/* Track */}
        <div className="w-full h-4 bg-cyber-dark border-2 border-cyber-green relative wireframe-border">
          {/* Progress */}
          <div 
            className="h-full bg-cyber-green neon-glow-green transition-all duration-200"
            style={{ width: `${percentage}%` }}
          />
          
          {/* Thumb indicator - positioned inside track with original working logic */}
          <div 
            className="absolute w-8 h-8 bg-cyber-green border-2 border-cyber-green neon-glow-green transition-all duration-200 pointer-events-none"
            style={{ 
              top: '50%',
              left: `${percentage}%`,
              transform: 'translate(-50%, -50%)'
            }}
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
      
      {/* Min/Max labels - hidden from user, they just see intensity indicators */}
      <div className="flex justify-between mt-2 text-sm text-cyber-cyan matrix-text">
        <span>[MIN]</span>
        <span>[MAX]</span>
      </div>
    </div>
  );
};

export default Slider;
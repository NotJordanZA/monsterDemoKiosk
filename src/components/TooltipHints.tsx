import React, { useState, useEffect } from 'react';
import { TooltipHint } from '../types';

interface TooltipHintsProps {
  hints: TooltipHint[];
  rotationInterval?: number;
}

const TooltipHints: React.FC<TooltipHintsProps> = ({ 
  hints, 
  rotationInterval = 4000 
}) => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (hints.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentHintIndex((prev) => (prev + 1) % hints.length);
        setIsVisible(true);
      }, 300); // Fade out duration
      
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [hints.length, rotationInterval]);

  if (hints.length === 0) return null;

  const currentHint = hints[currentHintIndex];
  const isPromptHint = currentHint.type === 'prompt';

  return (
    <div className="text-center">
      <div className={`transition-all duration-300 ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}>
        <div className={`inline-flex items-center px-6 py-3 border-2 wireframe-border ${
          isPromptHint 
            ? 'bg-cyber-dark bg-opacity-90 border-cyber-green text-cyber-green neon-glow-green' 
            : 'bg-cyber-dark bg-opacity-90 border-cyber-cyan text-cyber-cyan neon-glow-cyan'
        } backdrop-blur-sm`}>
          {/* Cyberpunk-style icon */}
          <div className="mr-3 text-lg matrix-text">
            {isPromptHint ? '[>]' : '[i]'}
          </div>
          
          {/* Hint text */}
          <span className="font-medium text-lg matrix-text tracking-wide uppercase">
            {currentHint.text.toUpperCase()}
          </span>
          
          {/* Animated dots if it's rotating */}
          {hints.length > 1 && (
            <div className="ml-4 flex space-x-1">
              {hints.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 wireframe-border transition-all duration-300 ${
                    index === currentHintIndex 
                      ? (isPromptHint ? 'bg-cyber-green neon-glow-green' : 'bg-cyber-cyan neon-glow-cyan')
                      : 'bg-cyber-light-gray bg-opacity-30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Gaming-style decorative elements */}
      <div className="flex justify-center mt-4 space-x-8 opacity-30">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyber-green to-transparent"></div>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent"></div>
      </div>
    </div>
  );
};

export default TooltipHints;
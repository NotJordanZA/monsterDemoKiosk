import React, { useState, useCallback } from 'react';
import { StreamDiffusionParams } from '../types';
import Button from './Button';
import Input from './Input';
import Slider from './Slider';

interface StreamDiffusionInterfaceProps {
  params: StreamDiffusionParams;
  onParamsChange: (params: StreamDiffusionParams) => void;
  onSend: (params: StreamDiffusionParams) => void;
}

const StreamDiffusionInterface: React.FC<StreamDiffusionInterfaceProps> = ({
  params,
  onParamsChange,
  onSend
}) => {
  const [isSending, setIsSending] = useState(false);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = { ...params, prompt: e.target.value };
    onParamsChange(newParams);
  }, [params, onParamsChange]);

  const handleStepsChange = useCallback((steps: number) => {
    const newParams = { ...params, steps };
    onParamsChange(newParams);
  }, [params, onParamsChange]);

  const handleSend = useCallback(async () => {
    if (!params.prompt.trim()) return;
    
    setIsSending(true);
    try {
      await onSend(params);
    } finally {
      setIsSending(false);
    }
  }, [params, onSend]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSending && params.prompt.trim()) {
      handleSend();
    }
  }, [handleSend, isSending, params.prompt]);

  return (
    <div className="wireframe-border bg-cyber-dark bg-opacity-90 backdrop-blur-sm p-8 neon-glow-green">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyber-green mb-2 matrix-text tracking-wider">
          [REAL_TIME_TRANSFORMATION]
        </h1>
        <p className="text-cyber-cyan text-lg font-cyber uppercase tracking-widest">
          {'>> TOUCHDESIGNER_MATRIX_INTERFACE <<'}
        </p>
      </div>

      <div className="space-y-8">
        {/* Prompt Input */}
        <Input
          label="Transformation Prompt"
          value={params.prompt}
          onChange={handlePromptChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter transformation prompt... (e.g., 'Batman in a cyberpunk city')"
          size="xl"
          required
        />

        {/* Effect Intensity Slider */}
        <Slider
          label="Effect Intensity"
          value={params.steps}
          min={1}
          max={65}
          onChange={handleStepsChange}
          showValue={true}
          valueLabel="intensity"
        />

        {/* Send Button */}
        <div className="pt-4">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            glowing={!isSending && params.prompt.trim().length > 0}
            disabled={isSending || !params.prompt.trim()}
            onClick={handleSend}
          >
            {isSending ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-monster-dark mr-3"></div>
                Applying Transformation...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="mr-2">🎯</span>
                Apply Transformation
                <span className="ml-2">⚡</span>
              </div>
            )}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cyber-green border-opacity-50">
          <div className="text-center wireframe-border p-3 neon-glow-cyan">
            <div className="text-2xl font-bold text-cyber-cyan matrix-text">
              {params.prompt.length}
            </div>
            <div className="text-xs text-cyber-green font-cyber uppercase tracking-widest">
              [CHAR_COUNT]
            </div>
          </div>
          <div className="text-center wireframe-border p-3 neon-glow-cyan">
            <div className="text-2xl font-bold text-cyber-cyan matrix-text">
              {Math.round((params.steps / 65) * 100)}%
            </div>
            <div className="text-xs text-cyber-green font-cyber uppercase tracking-widest">
              [INTENSITY_LVL]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDiffusionInterface;
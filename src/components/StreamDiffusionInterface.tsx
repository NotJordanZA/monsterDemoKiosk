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
    <div className="bg-monster-gray bg-opacity-80 backdrop-blur-sm rounded-2xl p-8 border border-monster-light-gray border-opacity-50 monster-glow">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-monster-white mb-2">
          Real-Time Transformation
        </h1>
        <p className="text-monster-silver text-lg">
          Transform live camera feed with TouchDesigner
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
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-monster-light-gray border-opacity-30">
          <div className="text-center">
            <div className="text-2xl font-bold text-monster-green">
              {params.prompt.length}
            </div>
            <div className="text-sm text-monster-silver">
              Characters
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-monster-green">
              {params.steps}%
            </div>
            <div className="text-sm text-monster-silver">
              Effect Strength
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDiffusionInterface;
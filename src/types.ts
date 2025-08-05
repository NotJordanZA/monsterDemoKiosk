export interface StreamDiffusionParams {
  prompt: string;
  steps: number;
}

export interface TooltipHint {
  id: string;
  text: string;
  type: 'prompt' | 'general';
}

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  [key: string]: any;
}
import React, { useState } from 'react';
import { RotateCcw, Download, Maximize, Eye, EyeOff, MessageCircle, Send, RefreshCw } from 'lucide-react';

interface ReconstructionViewerProps {
  isReconstructing: boolean;
  onComplete: () => void;
  onStartIteration: (prompt: string) => void;
  iterationCount: number;
  showAIPrompt: boolean;
}

export function ReconstructionViewer({ 
  isReconstructing, 
  onComplete, 
  onStartIteration, 
  iterationCount, 
  showAIPrompt 
}: ReconstructionViewerProps) {
  const [viewMode, setViewMode] = useState<'skull' | 'face' | 'overlay'>('face');
  const [progress, setProgress] = useState(0);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  React.useEffect(() => {
    if (isReconstructing) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(onComplete, 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isReconstructing, onComplete]);

  const handleSendPrompt = () => {
    if (aiPrompt.trim()) {
      onStartIteration(aiPrompt);
      setAiPrompt('');
      setShowPromptInput(false);
    }
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">3D Facial Reconstruction</h3>
            {iterationCount > 0 && (
              <p className="text-sm text-blue-600 font-medium">Iteration {iterationCount + 1}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {!isReconstructing && (
              <button
                onClick={() => setShowPromptInput(!showPromptInput)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">AI Assistant</span>
              </button>
            )}
            <button
              onClick={() => setViewMode(viewMode === 'skull' ? 'face' : 'skull')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'skull' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm">{viewMode === 'skull' ? 'Show Face' : 'Show Skull'}</span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Maximize className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center">
        {isReconstructing ? (
          <div className="text-center space-y-4">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Reconstructing Face...</h4>
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{progress}% Complete</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <div className="text-6xl">👤</div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Reconstruction Complete</h4>
              <p className="text-gray-600">3D facial model generated successfully</p>
            </div>
            
            {/* View Mode Controls */}
            <div className="flex justify-center space-x-2 mt-4">
              {(['skull', 'face', 'overlay'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assistant Prompt */}
      {showAIPrompt && !isReconstructing && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-2">AI Reconstruction Assistant</h4>
                <p className="text-gray-700 mb-4">
                  Great! Your facial reconstruction is complete. Would you like me to make any adjustments? 
                  I can modify facial features like eyebrow thickness, skin tone, face shape (thin/thick), 
                  nose shape, or any other characteristics you'd like to refine.
                </p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the changes you'd like (e.g., 'make face thinner', 'darker skin tone', 'thicker eyebrows')"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
                  />
                  <button
                    onClick={handleSendPrompt}
                    disabled={!aiPrompt.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refine</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual AI Prompt Input */}
      {showPromptInput && !isReconstructing && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Tell me what you'd like to adjust in the reconstruction..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSendPrompt()}
            />
            <button
              onClick={handleSendPrompt}
              disabled={!aiPrompt.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Info Panel */}
      {!isReconstructing && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Processing Time</p>
              <p className="text-lg font-semibold text-gray-900">2.3s</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accuracy Score</p>
              <p className="text-lg font-semibold text-green-600">{94.2 - (iterationCount * 0.5)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vertices</p>
              <p className="text-lg font-semibold text-gray-900">{156843 + (iterationCount * 1200)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
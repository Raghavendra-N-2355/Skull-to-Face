import React, { useState } from 'react';
import { SkullUpload } from './SkullUpload';
import { AnalysisStage } from './AnalysisStage';
import { ReconstructionViewer } from './ReconstructionViewer';
import { CheckCircle, ArrowRight, Save } from 'lucide-react';

interface WorkflowStage {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
}

interface AnalysisResult {
  completeness: number;
  isComplete: boolean;
  species: string;
  confidence: number;
  isHuman: boolean;
  reconstructionNeeded: boolean;
}

interface ReconstructionIteration {
  id: string;
  prompt: string;
  timestamp: Date;
  changes: string[];
}
export function ReconstructionWorkflow() {
  const [currentStage, setCurrentStage] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [iterations, setIterations] = useState<ReconstructionIteration[]>([]);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [currentSessionId] = useState(() => Date.now().toString());

  const stages: WorkflowStage[] = [
    {
      id: 'upload',
      title: 'Upload Skull Image',
      description: 'Upload high-quality skull image for analysis',
      status: currentStage === 0 ? 'active' : currentStage > 0 ? 'completed' : 'pending'
    },
    {
      id: 'analysis',
      title: 'Analysis & Validation',
      description: 'AI analyzes completeness and species identification',
      status: currentStage === 1 ? 'active' : currentStage > 1 ? 'completed' : 'pending'
    },
    {
      id: 'reconstruction',
      title: '3D Reconstruction',
      description: 'Generate detailed facial reconstruction',
      status: currentStage === 2 ? 'active' : currentStage > 2 ? 'completed' : 'pending'
    }
  ];

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStage(1);
      setIsAnalyzing(true);
      
      // Simulate analysis
      setTimeout(() => {
        const mockResult: AnalysisResult = {
          completeness: Math.random() > 0.3 ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 30) + 50,
          isComplete: Math.random() > 0.3,
          species: Math.random() > 0.2 ? 'Homo sapiens' : Math.random() > 0.5 ? 'Pan troglodytes' : 'Gorilla gorilla',
          confidence: Math.floor(Math.random() * 20) + 80,
          isHuman: Math.random() > 0.2,
          reconstructionNeeded: Math.random() > 0.4
        };
        mockResult.isHuman = mockResult.species === 'Homo sapiens';
        
        setAnalysisResult(mockResult);
        setIsAnalyzing(false);
      }, 3000);
    }, 2000);
  };

  const handleProceedToReconstruction = () => {
    setCurrentStage(2);
    setIsReconstructing(true);
  };

  const handleReconstructionComplete = () => {
    setIsReconstructing(false);
    setShowAIPrompt(true);
  };

  const handleStartIteration = (prompt: string) => {
    const newIteration: ReconstructionIteration = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
      changes: generateChangesFromPrompt(prompt)
    };
    
    setIterations(prev => [...prev, newIteration]);
    setShowAIPrompt(false);
    setIsReconstructing(true);
    
    // Simulate reconstruction time for iteration
    setTimeout(() => {
      setIsReconstructing(false);
      setShowAIPrompt(true);
    }, 3000);
  };

  const generateChangesFromPrompt = (prompt: string): string[] => {
    const changes: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('thin') || lowerPrompt.includes('skinny')) {
      changes.push('Face shape: Thinner');
    }
    if (lowerPrompt.includes('thick') || lowerPrompt.includes('fat') || lowerPrompt.includes('fuller')) {
      changes.push('Face shape: Fuller');
    }
    if (lowerPrompt.includes('eyebrow')) {
      changes.push('Eyebrow adjustment');
    }
    if (lowerPrompt.includes('skin') || lowerPrompt.includes('tone')) {
      changes.push('Skin tone modification');
    }
    if (lowerPrompt.includes('nose')) {
      changes.push('Nose shape adjustment');
    }
    if (lowerPrompt.includes('dark') || lowerPrompt.includes('light')) {
      changes.push('Skin tone adjustment');
    }
    
    return changes.length > 0 ? changes : ['General facial refinement'];
  };

  const handleSaveToHistory = () => {
    // In a real app, this would save to a database
    const historyEntry = {
      id: currentSessionId,
      date: new Date(),
      originalImage: uploadedImage?.name || 'skull-image.jpg',
      skullCompleteness: analysisResult?.completeness || 0,
      species: analysisResult?.species || 'Unknown',
      confidence: analysisResult?.confidence || 0,
      iterations: iterations,
      finalCharacteristics: iterations.flatMap(iter => iter.changes),
      processingTime: `${2.3 + (iterations.length * 0.8)}s`
    };
    
    // Store in localStorage for demo purposes
    const existingHistory = JSON.parse(localStorage.getItem('reconstructionHistory') || '[]');
    existingHistory.unshift(historyEntry);
    localStorage.setItem('reconstructionHistory', JSON.stringify(existingHistory));
    
    alert('Reconstruction saved to history!');
  };

  const handleRejectAndRetry = () => {
    setCurrentStage(0);
    setAnalysisResult(null);
    setUploadedImage(null);
    setIsProcessing(false);
    setIsAnalyzing(false);
    setIsReconstructing(false);
    setIterations([]);
    setShowAIPrompt(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  stage.status === 'completed' 
                    ? 'bg-green-600 text-white' 
                    : stage.status === 'active' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stage.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold ${
                    stage.status === 'active' ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {stage.title}
                  </h3>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-5 h-5 text-gray-400 mx-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stage Content */}
      <div className="space-y-8">
        {currentStage === 0 && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Skull Image</h2>
                <p className="text-gray-600">
                  Please upload a clear, high-resolution image of the skull for analysis and reconstruction.
                </p>
              </div>
              <SkullUpload onImageUpload={handleImageUpload} isProcessing={isProcessing} />
            </div>
          </div>
        )}

        {currentStage >= 1 && (
          <AnalysisStage
            result={analysisResult}
            isAnalyzing={isAnalyzing}
            onProceed={handleProceedToReconstruction}
            onReject={handleRejectAndRetry}
          />
        )}

        {currentStage >= 2 && (
          <ReconstructionViewer
            isReconstructing={isReconstructing}
            onComplete={handleReconstructionComplete}
            onStartIteration={handleStartIteration}
            iterationCount={iterations.length}
            showAIPrompt={showAIPrompt}
          />
        )}

        {/* Iterations History */}
        {iterations.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Reconstruction Iterations</h3>
              <button
                onClick={handleSaveToHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save to History</span>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {iterations.map((iteration, index) => (
                  <div key={iteration.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Iteration {index + 1}</h4>
                        <p className="text-sm text-gray-600">
                          {iteration.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {iteration.changes.length} changes
                      </span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">User Prompt:</p>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded text-sm">"{iteration.prompt}"</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Applied Changes:</p>
                      <div className="flex flex-wrap gap-2">
                        {iteration.changes.map((change, changeIndex) => (
                          <span
                            key={changeIndex}
                            className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200"
                          >
                            {change}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
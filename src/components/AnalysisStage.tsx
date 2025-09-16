import React from 'react';
import { CheckCircle, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface AnalysisResult {
  completeness: number;
  isComplete: boolean;
  species: string;
  confidence: number;
  isHuman: boolean;
  reconstructionNeeded: boolean;
}

interface AnalysisStageProps {
  result: AnalysisResult | null;
  isAnalyzing: boolean;
  onProceed: () => void;
  onReject: () => void;
}

export function AnalysisStage({ result, isAnalyzing, onProceed, onReject }: AnalysisStageProps) {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-center space-x-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Analyzing Skull...</h3>
            <p className="text-gray-600">Running AI analysis for completeness and species identification</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h3>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Completeness Analysis */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {result.isComplete ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            )}
            <h4 className="text-lg font-semibold text-gray-900">Skull Completeness</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completeness Score</span>
              <span className="font-semibold">{result.completeness}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  result.completeness >= 80 ? 'bg-green-500' : 
                  result.completeness >= 60 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.completeness}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {result.reconstructionNeeded 
                ? 'Symmetrical reconstruction will be applied to missing parts'
                : 'Skull is complete and ready for facial reconstruction'}
            </p>
          </div>
        </div>

        {/* Species Identification */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            {result.isHuman ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )}
            <h4 className="text-lg font-semibold text-gray-900">Species Identification</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Identified as</span>
              <span className="font-semibold">{result.species}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Confidence</span>
              <span className="font-semibold">{result.confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${
                  result.confidence >= 90 ? 'bg-green-500' : 
                  result.confidence >= 75 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {result.isHuman ? (
          <button
            onClick={onProceed}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold"
          >
            <span>Proceed to Reconstruction</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-red-600 font-medium">
              Non-human skull detected. Please upload a human skull for facial reconstruction.
            </p>
            <button
              onClick={onReject}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-semibold"
            >
              Upload New Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
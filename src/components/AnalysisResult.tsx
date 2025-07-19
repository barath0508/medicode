import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Share2, RotateCcw, Sparkles, Globe } from 'lucide-react';

interface AnalysisResultProps {
  result: string;
  tamilResult: string;
  hindiResult: string;
  isAnalyzing: boolean;
  onReset: () => void;
  onSpeak: (text: string, language: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
}

export default function AnalysisResult({
  result,
  tamilResult,
  hindiResult,
  isAnalyzing,
  onReset,
  onSpeak,
  onStopSpeaking,
  isSpeaking
}: AnalysisResultProps) {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'english' | 'tamil' | 'hindi'>('english');

  const handleCopy = async (text: string, language: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(language);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MediCode Analysis Result',
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy(text, 'shared');
    }
  };

  const getLanguageCode = (language: string) => {
    const codes: { [key: string]: string } = {
      'english': 'en-US',
      'tamil': 'ta-IN',
      'hindi': 'hi-IN'
    };
    return codes[language] || 'en-US';
  };

  const getCurrentText = () => {
    switch (activeLanguage) {
      case 'tamil': return tamilResult;
      case 'hindi': return hindiResult;
      default: return result;
    }
  };

  if (isAnalyzing) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-emerald-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Analysis Result
          </h3>
        </div>

        <div className="border-t border-emerald-200/30 dark:border-gray-600/30 pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mt-6 mb-2">
              Analyzing your image...
            </h4>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 text-center">
              Generating analysis in English, Tamil, and Hindi...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasValidResult = result && 
    !result.includes('Take or upload') && 
    !result.includes('Analysis failed') && 
    !result.includes('Could not analyze');

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-emerald-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          Analysis Result
        </h3>
        <div className="ml-auto flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Multi-language</span>
        </div>
      </div>

      {hasValidResult && (
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <button
              onClick={() => setActiveLanguage('english')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeLanguage === 'english'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLanguage('tamil')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeLanguage === 'tamil'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setActiveLanguage('hindi')}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeLanguage === 'hindi'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-emerald-200/30 dark:border-gray-600/30 pt-6">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
            {getCurrentText()}
          </p>
        </div>

        {hasValidResult && (
          <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-emerald-100/50 dark:border-gray-700/50">
            <button
              onClick={isSpeaking ? onStopSpeaking : () => onSpeak(getCurrentText(), getLanguageCode(activeLanguage))}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105
                ${isSpeaking
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 shadow-lg'
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 shadow-lg'
                }
              `}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>

            <button
              onClick={() => handleCopy(getCurrentText(), activeLanguage)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Copy className="w-4 h-4" />
              {copySuccess === activeLanguage ? 'Copied!' : 'Copy'}
            </button>

            <button
              onClick={() => handleShare(getCurrentText())}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            Scan New Medicine
          </button>
        </div>
      </div>
    </div>
  );
}
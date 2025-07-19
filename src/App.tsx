import React, { useState, useEffect } from 'react';
import { FileText, Camera as CameraIcon, MessageCircle, Stethoscope, Activity, Heart } from 'lucide-react';
import Camera from './components/Camera';
import ImageUpload from './components/ImageUpload';
import AnalysisResult from './components/AnalysisResult';
import History, { HistoryItem } from './components/History';
import MedicalChatbot from './components/MedicalChatbot';
import ThemeToggle from './components/ThemeToggle';
import FloatingElements from './components/FloatingElements';
import useTextToSpeech from './hooks/useTextToSpeech';
import useLocalStorage from './hooks/useLocalStorage';
import useTranslation from './hooks/useTranslation';
import { analyzeImage } from './services/geminiApi';
import { getLanguageName } from './utils/translations';    

function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'history' | 'chatbot'>('scanner');
  const [isDarkMode, setIsDarkMode] = useLocalStorage('MediCode-dark-mode', false);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('MediCode-history', []);
  const [analysisState, setAnalysisState] = useState({
    result: 'Take or upload a photo to analyze the medicine',
    tamilResult: 'மருந்தை பகுப்பாய்வு செய்ய புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
    hindiResult: 'दवा का विश्लेषण करने के लिए फोटो लें या अपलोड करें',
    isAnalyzing: false,
    hasImage: false,
    currentImage: ''
  });

  const { speak, stop, isSpeaking, getLanguageCode } = useTextToSpeech();
  const t = useTranslation('en');

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleImageCapture = async (imageData: string) => {
    stop();
    
    setAnalysisState({
      result: 'Analyzing medicine...',
      tamilResult: 'மருந்தை பகுப்பாய்வு செய்கிறோம்...',
      hindiResult: 'दवा का विश्लेषण कर रहे हैं...',
      isAnalyzing: true,
      hasImage: true,
      currentImage: imageData
    });

    try {
      const response = await analyzeImage(imageData);
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        result: response.result,
        tamilResult: response.tamilResult,
        hindiResult: response.hindiResult,
        timestamp: new Date(),
      };

      setHistory(prev => [newHistoryItem, ...prev]);
      
      setAnalysisState({
        result: response.result,
        tamilResult: response.tamilResult,
        hindiResult: response.hindiResult,
        isAnalyzing: false,
        hasImage: true,
        currentImage: imageData
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisState({
        result: 'Analysis failed. Please try again.',
        tamilResult: 'பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
        hindiResult: 'विश्लेषण असफल। कृपया पुनः प्रयास करें।',
        isAnalyzing: false,
        hasImage: true,
        currentImage: imageData
      });
    }
  };

  const handleReset = () => {
    stop();
    setAnalysisState({
      result: 'Take or upload a photo to analyze the medicine',
      tamilResult: 'மருந்தை பகுப்பாய்வு செய்ய புகைப்படம் எடுக்கவும் அல்லது பதிவேற்றவும்',
      hindiResult: 'दवा का विश्लेषण करने के लिए फोटो लें या अपलोड करें',
      isAnalyzing: false,
      hasImage: false,
      currentImage: ''
    });
  };

  const handleSpeak = (text: string, languageCode: string) => {
    speak(text, languageCode);
  };

  const handleSpeakHistoryItem = (text: string, languageCode: string) => {
    speak(text, languageCode);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20 transition-all duration-500 relative overflow-hidden">
      {/* Floating Background Elements */}
      <FloatingElements />
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-teal-300 to-emerald-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-blue-300 to-cyan-300 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-emerald-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <Stethoscope className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-ping"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  MediCode
                </h1>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Heart className="w-3 h-3 animate-pulse" />
                  <span>AI Medical Assistant</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Online</span>
              </div>
              <ThemeToggle 
                isDark={isDarkMode} 
                onToggle={() => setIsDarkMode(!isDarkMode)} 
                languageCode="en"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-b border-emerald-200/30 dark:border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'scanner'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400'
              }`}
            >
              <CameraIcon className="w-4 h-4" />
              {t.scanner}
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'chatbot'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Medical Chat
              <div className="w-2 h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-full animate-pulse"></div>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'history'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              {t.history} ({history.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="animate-fadeIn">
          {activeTab === 'scanner' ? (
            <div className="space-y-8">
              {/* Camera/Upload Section */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Camera Preview */}
                <div className="space-y-4 animate-slideInLeft">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {t.camera}
                  </h2>
                  <div className="aspect-[4/3] bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-emerald-900/20 rounded-3xl overflow-hidden shadow-2xl border border-emerald-200/50 dark:border-gray-700/50 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-300">
                    {!analysisState.hasImage ? (
                      <Camera
                        onCapture={handleImageCapture}
                        isAnalyzing={analysisState.isAnalyzing}
                        selectedLanguage="Multi-language Analysis"
                        languageCode="multi"
                      />
                    ) : (
                      <div className="relative h-full">
                        <img
                          src={analysisState.currentImage}
                          alt="Captured medicine"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            <span className="text-white text-xs font-medium">Captured</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Section */}
                <div className="space-y-4 animate-slideInRight">
                  <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {t.uploadFromGallery}
                  </h2>
                  <div className="aspect-[4/3]">
                    <ImageUpload
                      onImageSelect={handleImageCapture}
                      isAnalyzing={analysisState.isAnalyzing}
                      languageCode="multi"
                      className="h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Analysis Result */}
              {(analysisState.hasImage || analysisState.isAnalyzing) && (
                <div className="animate-slideUp">
                  <AnalysisResult
                    result={analysisState.result}
                    tamilResult={analysisState.tamilResult}
                    hindiResult={analysisState.hindiResult}
                    isAnalyzing={analysisState.isAnalyzing}
                    onReset={handleReset}
                    onSpeak={handleSpeak}
                    onStopSpeaking={stop}
                    isSpeaking={isSpeaking}
                  />
                </div>
              )}
            </div>
          ) : activeTab === 'chatbot' ? (
            <div className="animate-fadeIn">
              <MedicalChatbot selectedLanguage="en" />
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Analysis History
                </h2>
                {history.length > 0 && (
                  <div className="text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
                    {history.length} {history.length === 1 ? 'scan' : 'scans'}
                  </div>
                )}
              </div>

              <History
                history={history}
                t={t} // ✅ Pass the translation object here
                onDeleteItem={handleDeleteHistoryItem}
                onSpeakItem={handleSpeakHistoryItem}
                onSwitchToScanner={() => setActiveTab('scanner')}
                />

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { Clock, Volume2, Copy, Trash2, Share2, FileText, Calendar } from 'lucide-react';
import type { Translation } from '../utils/translations';
import {Globe } from 'lucide-react';
import { getLanguageName } from '../utils/translations';

export interface HistoryItem {
  id: string;
  result: string;
  tamilResult: string;
  hindiResult: string;
  timestamp: Date;
}

interface HistoryProps {
  history: HistoryItem[];
  t: Translation;
  onDeleteItem: (id: string) => void;
  onSpeakItem: (text: string, language: string) => void;
  onSwitchToScanner: () => void;
}

export default function History({ history, t, onDeleteItem, onSpeakItem, onSwitchToScanner }: HistoryProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeLanguages, setActiveLanguages] = useState<{ [key: string]: 'english' | 'tamil' | 'hindi' }>({});

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return t.justNow;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t.minutesAgo}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t.hoursAgo}`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t.daysAgo}`;
    
    return date.toLocaleDateString();
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleShare = async (text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t.appTitle} ${t.analysisResult}`,
          text: text,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      await navigator.clipboard.writeText(text);
    }
  };

  const handleDelete = (id: string) => {
    if (deleteConfirm === id) {
      onDeleteItem(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const setActiveLanguage = (itemId: string, language: 'english' | 'tamil' | 'hindi') => {
    setActiveLanguages(prev => ({ ...prev, [itemId]: language }));
  };

  const getActiveLanguage = (itemId: string) => {
    return activeLanguages[itemId] || 'english';
  };

  const getCurrentText = (item: HistoryItem) => {
    const activeLanguage = getActiveLanguage(item.id);
    switch (activeLanguage) {
      case 'tamil': return item.tamilResult;
      case 'hindi': return item.hindiResult;
      default: return item.result;
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

  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Clock className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-4">
          {t.noScanHistoryYet}
        </h2>
        <p className="text-emerald-600 dark:text-emerald-400 text-center max-w-sm mb-8">
          {t.analyzedMedicineDetails}
        </p>
        <button
          onClick={onSwitchToScanner}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <FileText className="w-4 h-4" />
          {t.scanYourFirstMedicine}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item, index) => {
        const isExpanded = selectedItem?.id === item.id;
        const currentText = getCurrentText(item);
        const truncatedResult = currentText.length > 200 
          ? currentText.substring(0, 200) + '...' 
          : currentText;
        const activeLanguage = getActiveLanguage(item.id);

        // Ensure timestamp is a Date object
        const timestamp = item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp);

        return (
          <div
            key={item.id}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-emerald-200/50 dark:border-gray-700/50 transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] animate-slideUp"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {t.scan} #{history.length - index}
                  </h3>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                      <Calendar className="w-3 h-3" />
                      {formatTimeAgo(timestamp)}
                    </div>
                    <div className="text-xs text-teal-600 dark:text-teal-400 font-medium mt-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      Multi-language
                    </div>
                  </div>
                </div>

                {/* Language Selector for History Item */}
                <div className="mb-4">
                  <div className="flex gap-1 p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <button
                      onClick={() => setActiveLanguage(item.id, 'english')}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        activeLanguage === 'english'
                          ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setActiveLanguage(item.id, 'tamil')}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        activeLanguage === 'tamil'
                          ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      தமிழ்
                    </button>
                    <button
                      onClick={() => setActiveLanguage(item.id, 'hindi')}
                      className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                        activeLanguage === 'hindi'
                          ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : 'text-emerald-700 dark:text-emerald-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <div className="border-t border-emerald-200/30 dark:border-gray-600/30 pt-4">
                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {isExpanded ? currentText : truncatedResult}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSpeakItem(currentText, getLanguageCode(activeLanguage))}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Volume2 className="w-3 h-3" />
                        {t.listen}
                      </button>

                      <button
                        onClick={() => handleCopy(currentText, item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Copy className="w-3 h-3" />
                        {copySuccess === item.id ? t.copied : t.copy}
                      </button>

                      <button
                        onClick={() => handleShare(currentText)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Share2 className="w-3 h-3" />
                        {t.share}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          deleteConfirm === item.id
                            ? 'text-white bg-red-600 hover:bg-red-700'
                            : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30'
                        }`}
                      >
                        <Trash2 className="w-3 h-3" />
                        {deleteConfirm === item.id ? t.confirm : t.delete}
                      </button>
                    </div>

                    {currentText.length > 200 && (
                      <button
                        onClick={() => setSelectedItem(isExpanded ? null : item)}
                        className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all duration-300 transform hover:scale-105"
                      >
                        {isExpanded ? t.showLess : t.viewDetails}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
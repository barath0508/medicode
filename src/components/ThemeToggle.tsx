import React from 'react';
import { Sun, Moon } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
  languageCode: string;
}

export default function ThemeToggle({ isDark, onToggle, languageCode }: ThemeToggleProps) {
  const t = useTranslation(languageCode);
  
  return (
    <button
      onClick={onToggle}
      className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-300 transform hover:scale-110"
      title={isDark ? t.switchToLightMode : t.switchToDarkMode}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
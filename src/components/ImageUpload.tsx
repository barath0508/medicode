import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  isAnalyzing: boolean;
  languageCode: string;
  className?: string;
}

export default function ImageUpload({ onImageSelect, isAnalyzing, languageCode, className = '' }: ImageUploadProps) {
  const t = useTranslation(languageCode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t.pleaseSelectImageFile);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    if (!isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      <div
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative h-full border-2 border-dashed rounded-3xl transition-all cursor-pointer transform hover:scale-[1.02] duration-300
          ${isDragging 
            ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/20' 
            : 'border-emerald-300 dark:border-emerald-600 hover:border-emerald-400 dark:hover:border-emerald-500 bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-800/80 dark:to-emerald-900/20'
          }
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
            {isDragging ? (
              <ImageIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-bounce" />
            ) : (
              <Upload className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
            {isDragging ? t.releaseToUpload : t.uploadFromGallery}
          </h3>
          
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">
            {isDragging 
            ? t.releaseToUpload 
            : t.dragAndDrop
            }
          </p>
          
          <div className="flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
            <span>Supports: JPG, PNG, WebP</span>
          </div>
        </div>
        
        {isDragging && (
          <span>{t.supportsFormats}</span>
        )}
      </div>
    </div>
  );
}
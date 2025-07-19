import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera as CameraIcon, StopCircle, RotateCcw, Zap } from 'lucide-react';
import useTranslation from '../hooks/useTranslation';

interface CameraProps {
  onCapture: (imageData: string) => void;
  isAnalyzing: boolean;
  selectedLanguage: string;
  languageCode: string;
}

export default function Camera({ onCapture, isAnalyzing, selectedLanguage, languageCode }: CameraProps) {
  const t = useTranslation(languageCode);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string>('');
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  const initializeCamera = useCallback(async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: deviceId ? undefined : 'environment',
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsInitialized(true);
        setError('');
      }
    } catch (err) {
      console.error('Camera initialization error:', err);
      setError('Camera access denied or not available');
      setIsInitialized(false);
    }
  }, []);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      if (videoDevices.length > 0 && !currentDeviceId) {
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear')
        ) || videoDevices[0];
        
        setCurrentDeviceId(backCamera.deviceId);
        initializeCamera(backCamera.deviceId);
      }
    } catch (err) {
      console.error('Error getting devices:', err);
    }
  }, [currentDeviceId, initializeCamera]);

  useEffect(() => {
    getDevices();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [getDevices]);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(imageData);
    }
  }, [onCapture, isAnalyzing]);

  const switchCamera = useCallback(() => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    setCurrentDeviceId(nextDevice.deviceId);
    initializeCamera(nextDevice.deviceId);
  }, [devices, currentDeviceId, initializeCamera]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-3xl p-8">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <CameraIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t.cameraUnavailable}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-black rounded-3xl overflow-hidden group">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {isInitialized && (
        <>
          {/* Focus Frame */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse">
            <div className="w-3/4 h-1/2 border-2 border-emerald-400/80 rounded-2xl bg-emerald-500/10 shadow-lg shadow-emerald-500/20">
              <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-emerald-400 rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-emerald-400 rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-emerald-400 rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-emerald-400 rounded-br-lg"></div>
            </div>
          </div>

          {/* Instruction Text */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-emerald-500/90 backdrop-blur-sm rounded-xl px-4 py-2 text-center animate-bounce">
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-white animate-pulse" />
                <p className="text-white text-sm font-medium">{t.positionMedicine}</p>
              </div>
            </div>
          </div>

          {/* Language Indicator */}
          <div className="absolute top-4 left-4">
            <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-white text-xs font-medium">{selectedLanguage}</span>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            {devices.length > 1 && (
              <button
                onClick={switchCamera}
                className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                title={t.switchCamera}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Capture Button */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              onClick={captureImage}
              disabled={isAnalyzing}
              className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 group-hover:animate-pulse"
              title={t.capturePhoto}
            >
              {isAnalyzing ? (
                <StopCircle className="w-8 h-8 text-white animate-spin" />
              ) : (
                <CameraIcon className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
        </>
      )}

      {!isInitialized && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      )}
    </div>
  );
}
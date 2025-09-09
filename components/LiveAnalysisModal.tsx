import React, { useState, useRef, useEffect, useCallback } from 'react';
// Fix: Import centralized SpeechRecognition types to resolve conflicts.
import type { LanguageCode, SpeechRecognition, SpeechRecognitionEvent } from '../types';

interface LiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (text: string, image: File) => void;
  language: LanguageCode;
}

const LiveAnalysisModal: React.FC<LiveAnalysisModalProps> = ({ isOpen, onClose, onCapture, language }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Fix: Use strongly-typed ref for speech recognition object.
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      const startCamera = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          alert("Could not access the camera. Please check permissions.");
          onClose();
        }
      };
      startCamera();
    } else {
      // Cleanup: stop camera stream when modal is closed
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition API is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    // Fix: Use strongly-typed event for onresult.
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        interimTranscript += event.results[i][0].transcript;
      }
      setTranscript(prev => prev + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;
  }, [language]);


  const captureImage = (): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video) {
        reject(new Error("Video element not found"));
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(new File([blob], 'live-capture.jpg', { type: 'image/jpeg' }));
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCapturePress = () => {
    setTranscript('');
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const handleCaptureRelease = async () => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    try {
      const imageFile = await captureImage();
      // A short delay to allow the final transcript to be processed
      setTimeout(() => {
          onCapture(transcript.trim() || "Analyze this image.", imageFile);
      }, 500);
    } catch (error) {
      console.error("Failed to capture image:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center" role="dialog" aria-modal="true">
      <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover"></video>
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20"></div>

      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 text-2xl" aria-label="Close live analysis">
        &times;
      </button>

      <div className="relative z-10 flex flex-col items-center justify-end h-full w-full p-8">
        <div className="text-white text-center text-lg mb-4 bg-black/50 p-2 rounded-md max-w-xl">
          <p>{transcript || (isRecording ? "Listening..." : "Press and hold to ask a question")}</p>
        </div>

        <button
          onMouseDown={handleCapturePress}
          onTouchStart={handleCapturePress}
          onMouseUp={handleCaptureRelease}
          onTouchEnd={handleCaptureRelease}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-200 ${isRecording ? 'bg-red-500 scale-110' : 'bg-white/30'}`}
          aria-label={isRecording ? 'Recording question' : 'Capture image and ask question'}
        >
          {/* Inner circle */}
          {!isRecording && <div className="w-16 h-16 bg-white rounded-full"></div>}
        </button>
      </div>
    </div>
  );
};

export default LiveAnalysisModal;

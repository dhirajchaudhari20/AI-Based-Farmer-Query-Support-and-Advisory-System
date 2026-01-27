
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { TRANSLATIONS } from '../constants';
// Removed unused icons
import { MultimodalLiveClient } from '../utils/websocket_client';
import { LanguageCode, User } from '../types';

interface LiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  location: string;
  user: User;
}

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor" />
  </svg>
)

const BotIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor" />
    <path d="M12 6C10.9 6 10 6.9 10 8C10 9.1 10.9 10 12 10C13.1 10 14 9.1 14 8C14 6.9 13.1 6 12 6Z" fill="currentColor" />
    <path d="M12 14C10.9 14 10 14.9 10 16C10 17.1 10.9 18 12 18C13.1 18 14 17.1 14 16C14 14.9 13.1 14 12 14Z" fill="currentColor" />
  </svg>
)


// Configuration
const URL = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent";
// @ts-ignore
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;
const MODEL = "models/gemini-2.0-flash-exp";
// const FRAME_RATE = 60; // Now handled separately for Preview (30) and Analysis (5)
const JPEG_QUALITY = 0.5;

// Utility functions for audio/video processing
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function decode(base64: string): ArrayBuffer {
  return base64ToUint8Array(base64).buffer as unknown as ArrayBuffer;
}

async function decodeAudioData(
  arrayBuffer: ArrayBuffer,
  audioContext: AudioContext,
  sampleRate: number = 24000,
  numberOfChannels: number = 1
): Promise<AudioBuffer> {

  // Create an audio buffer manually (since we know the raw PCM format)
  // The server sends RAW PCM 16-bit little-endian
  const pcm16 = new Int16Array(arrayBuffer);
  const audioContent = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    // Convert 16-bit integer to float [-1.0, 1.0]
    audioContent[i] = pcm16[i] / 32768.0;
  }

  const audioBuffer = audioContext.createBuffer(numberOfChannels, audioContent.length, sampleRate);
  audioBuffer.getChannelData(0).set(audioContent);
  return audioBuffer;
}


async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


type Status = 'disconnected' | 'connecting' | 'connected' | 'error';
type LiveServerMessage = any;

const LiveAnalysisModal: React.FC<LiveAnalysisModalProps> = ({ isOpen, onClose, language, location, user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>('disconnected');
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');

  // Refs to keep track of WebContext/Websocket state to avoid closure staleness in event handlers
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<MultimodalLiveClient> | null>(null);
  const currentTurnTextRef = useRef('');
  const frameTimeoutRef = useRef<number | null>(null);

  // TTS Helper
  const speak = useCallback((text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel(); // Stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a voice matching the language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : language === 'ml' ? 'ml' : language === 'gu' ? 'gu' : 'en-IN'; // Default to Indian English if not found

    // Prioritize "Google" voices or native ones
    const voice = voices.find(v => v.lang.startsWith(langPrefix) && v.name.includes("Google")) ||
      voices.find(v => v.lang.startsWith(langPrefix));

    if (voice) {
      utterance.voice = voice;
    }
    utterance.lang = langPrefix;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  useEffect(() => {
    let mounted = true;

    // Pre-load voices
    window.speechSynthesis.getVoices();

    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, [isOpen]);

  const cleanup = () => {
    // 1. Stop Video Stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // 2. Stop Audio Contexts
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Clean up output audio sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { } // ignore if already stopped
    });
    audioSourcesRef.current.clear();

    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    nextStartTimeRef.current = 0;


    // 3. Close Websocket Session
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        session.disconnect();
      }).catch(() => { }); // ignore errors during disconnect
      sessionPromiseRef.current = null;
    }

    // 4. Clear Loop Timers
    if (frameTimeoutRef.current) {
      window.clearTimeout(frameTimeoutRef.current);
      frameTimeoutRef.current = null;
    }

    // 5. Reset State
    setStatus('disconnected');
    setUserTranscript('');
    setModelTranscript('');
  };

  const handleClose = () => {
    cleanup();
    onClose();
  }


  const startSession = async () => {
    if (!API_KEY) {
      console.error("Missing VITE_GEMINI_API_KEY");
      setStatus('error');
      return;
    }

    try {
      setStatus('connecting');

      // Initialize Audio Context for playback
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputAudioCtx;

      // Initialize Video & Input Audio Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 30 } // Preview frame rate (Smooth for user)
        },
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true
        }
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // videoRef.current.play() is called in the event listener below or implicitly by autoPlay
      }

      // Initialize Client
      const sessionPromise = new MultimodalLiveClient({ apiKey: API_KEY, url: URL })
        .connect({
          model: MODEL,
          // Setup initial generation config if needed
          generationConfig: {
            responseModalities: "text", // We will use Browser TTS for native Indian accents
          },
          systemInstruction: {
            parts: [{
              text: `You are "Agri-Intel", an expert Indian agricultural advisor.
User Location: ${location}.
Language: ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'ml' ? 'Malayalam' : language === 'gu' ? 'Gujarati' : 'English'}.

CRITICAL INSTRUCTIONS:
1. Speak ONLY in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : language === 'ml' ? 'Malayalam' : language === 'gu' ? 'Gujarati' : 'English'}.
2. Use a typical INDIAN ACCENT and tone in your writing style (e.g. use "Namaste", "Ji", "Ram Ram").
3. Be warm, respectful, and talk like a knowledgeable local farmer/advisor.
4. Greet the user immediately in the target language.
5. Answer questions about crops, pests, and farming.
` }]
          }
        }, {
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setModelTranscript(prev => prev + text);
              currentTurnTextRef.current += text;
            }
            if (message.serverContent?.inputTranscription) {
              setUserTranscript(prev => prev + message.serverContent!.inputTranscription.text);
            }
            if (message.serverContent?.turnComplete) {
              // Speak the accumulated text for this turn
              const textToSpeak = currentTurnTextRef.current;
              if (textToSpeak) {
                speak(textToSpeak);
                // Reset for next turn? No, keep it so we can read it. 
                // But we need to clear it before the NEXT turn starts.
                // Actually, let's clear it immediately after sending to TTS, 
                // so next chunks start fresh.
                currentTurnTextRef.current = '';
              }
            }
            if (message.serverContent?.interrupted) {
              // Stop browser TTS if interrupted
              window.speechSynthesis.cancel();
              currentTurnTextRef.current = '';
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
            cleanup();
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed:', JSON.stringify({ code: e.code, reason: e.reason }));
            // This is a critical check for robustness. If the session closes but our cleanup
            // function hasn't run (which nulls out mediaStreamRef), it means the closure
            // was unexpected (e.g., network drop). We must inform the user.
            if (mediaStreamRef.current) {
              console.error('Session closed unexpectedly.');
              setStatus('error');
              cleanup(); // Stop frame loop
            }
          },
        });

      sessionPromise.then(async (session) => {
        setStatus('connected');

        // Trigger greeting with a system signal in TARGET LANGUAGE to force context
        const greeting = language === 'hi' ? "नमस्ते system." : language === 'mr' ? "नमस्कार system." : "Hello system.";
        session.send({
          client_content: {
            turns: [{ role: "user", parts: [{ text: greeting }] }],
            turn_complete: true
          }
        });

        // --- Audio Input Setup ---
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = audioCtx;

        try {
          await audioCtx.audioWorklet.addModule('/audio-processor.js');
        } catch (e) {
          console.error("Failed to load audio worklet:", e);
          // Fallback to ScriptProcessor if worklet fails? Or just fail.
          // For now, let's assume it works or fail hard.
        }

        const source = audioCtx.createMediaStreamSource(stream);

        const workletNode = new AudioWorkletNode(audioCtx, 'pcm-processor');
        // Buffer for accumulating audio samples to avoid flooding WebSocket
        let audioBufferAccumulator: Float32Array = new Float32Array(0);
        const BUFFER_SIZE = 4096;

        workletNode.port.onmessage = (event) => {
          if (!session) return;
          const inputData = event.data; // Float32Array

          // Append to accumulator
          const newBuffer = new Float32Array(audioBufferAccumulator.length + inputData.length);
          newBuffer.set(audioBufferAccumulator);
          newBuffer.set(inputData, audioBufferAccumulator.length);
          audioBufferAccumulator = newBuffer;

          // Only send if we have enough data (mimicking ScriptProcessor behavior)
          if (audioBufferAccumulator.length >= BUFFER_SIZE) {
            const chunkToSend = audioBufferAccumulator.slice(0, BUFFER_SIZE);
            audioBufferAccumulator = audioBufferAccumulator.slice(BUFFER_SIZE);

            const pcmData = new Int16Array(chunkToSend.length);
            for (let i = 0; i < chunkToSend.length; i++) {
              const s = Math.max(-1, Math.min(1, chunkToSend[i]));
              pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            let binary = '';
            const uint8 = new Uint8Array(pcmData.buffer);
            const len = uint8.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(uint8[i]);
            }
            const b64 = btoa(binary);

            session.sendRealtimeInput({
              media_chunks: [{
                mime_type: "audio/pcm;rate=16000",
                data: b64
              }]
            });
          }
        };

        source.connect(workletNode);
        workletNode.connect(audioCtx.destination);


        // --- Video Input Setup ---
        const videoEl = videoRef.current;
        const canvasEl = canvasRef.current;

        if (videoEl && canvasEl) {

          const startFrameCapture = () => {
            if (!mediaStreamRef.current) return;

            const ctx = canvasEl.getContext('2d');
            if (!ctx) return;

            const frameLoop = async () => {
              if (!mediaStreamRef.current) return; // Stop if stream closed

              try {
                if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                  canvasEl.width = videoEl.videoWidth;
                  canvasEl.height = videoEl.videoHeight;
                  ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
                  console.log("Captured and sending frame."); // Log frame capture for debugging.

                  // Optimize: Reduce quality slightly for faster transmission if needed, keeping 0.5 for now
                  const blob = await new Promise<Blob | null>(resolve => canvasEl.toBlob(resolve, 'image/jpeg', 0.5));

                  if (blob && mediaStreamRef.current) {
                    const session = await sessionPromiseRef.current;
                    // Check backpressure - only send if connection is clear
                    if (session && mediaStreamRef.current && session.canSendVideo()) {
                      const base64Data = await blobToBase64(blob);
                      // Double check session is still open after async op
                      if (session.isConnected()) {
                        session.sendRealtimeInput({
                          media_chunks: [{ data: base64Data, mime_type: 'image/jpeg' }]
                        });
                      }
                    } else {
                      console.log("Skipping frame to reduce latency (network busy)");
                    }
                  }
                }
              } catch (e) {
                console.error("Error in frame capture loop:", e);
              } finally {
                // Schedule next frame: Capture at 5 FPS (200ms) for analysis - sufficient for AI and saves bandwidth
                // The VIDEO PREVIEW remains 30 FPS because of getUserMedia settings.
                if (mediaStreamRef.current) { // Only schedule if the stream is still active
                  frameTimeoutRef.current = window.setTimeout(frameLoop, 200);
                }
              }
            };

            // Start the loop
            frameLoop();
          };

          // This is a critical fix: The 'playing' event ensures the video has valid dimensions
          // and is actually rendering before we try to capture frames from it.
          videoEl.addEventListener('playing', startFrameCapture, { once: true });
          videoEl.play().catch(e => { // Autoplay might be blocked
            console.error("Video play failed:", e);
            // You might want to show a "Click to Start" button here as a fallback
          });
        }

      }); // End of session callback

      sessionPromiseRef.current = sessionPromise;

    } catch (error) {
      console.error('Failed to start live session:', error);
      setStatus('error');
      cleanup();
    }
  };


  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
          <div className="bg-white dark:bg-[#0D1117] rounded-2xl w-full max-w-4xl h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{TRANSLATIONS.liveSession[language]}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold">&times;</button>
            </div>

            <div className="flex-1 relative bg-black">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-3 rounded-lg text-white text-sm backdrop-blur-md">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center"><UserIcon /></div>
                  <p className="flex-1 min-h-[1.25rem]">{userTranscript}</p>
                </div>
                <div className="flex items-start gap-3 mt-2">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"><BotIcon /></div>
                  <p className="flex-1 min-h-[1.25rem] font-medium">{modelTranscript}</p>
                </div>
              </div>

              {status === 'connecting' && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                  <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <p className="mt-4">Connecting...</p>
                </div>
              )}
              {status === 'error' && (
                <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white p-4">
                  <p className="font-semibold">Connection Error</p>
                  <p className="text-sm text-center mt-2">Could not establish a live session. Please check your camera/microphone permissions and try again.</p>
                  <button onClick={handleClose} className="mt-4 px-4 py-2 bg-white text-red-800 rounded-lg text-sm">Close</button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default LiveAnalysisModal;
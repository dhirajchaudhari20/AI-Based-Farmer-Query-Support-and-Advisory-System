import React, { useState, useEffect, useRef, useCallback } from 'react';
// Fix: Remove non-existent 'LiveSession' from imports. The session type is not exported and should be inferred.
import { GoogleGenAI, Modality, LiveServerMessage, Blob as GenAI_Blob } from '@google/genai';
import type { LanguageCode, User } from '../types';
import { TRANSLATIONS, LANGUAGES } from '../constants';
import { analyticsService, CurrentWeather } from '../services/analyticsService';
import { getGenAI } from '../services/geminiService';
import UserIcon from './icons/UserIcon';
import BotIcon from './icons/BotIcon';

// --- Gemini API Initialization removed (lazy loaded) ---

// --- Audio Encoding/Decoding Helpers (as per Gemini docs) ---
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      if (base64Data) {
        resolve(base64Data);
      } else {
        reject(new Error("Failed to read blob as base64"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};


interface LiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  location: string;
  user: User;
}

const FRAME_RATE = 30; // Increased from 20 for lower latency
const JPEG_QUALITY = 0.6; // Keep quality low for faster uploads

const getLiveSystemInstruction = (userName: string, location: string, language: LanguageCode, weather: CurrentWeather | null): string => {
  const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
  // The weather information is now a core part of the context.
  const weatherContext = weather
    ? `\n**CRITICAL CONTEXT: CURRENT WEATHER IN ${location.toUpperCase()}**\n- Conditions: ${weather.condition}\n- Temperature: ${weather.temp}\n- Humidity: ${weather.humidity}%\nThis environmental data is crucial. Your diagnosis MUST consider these conditions. For example, high humidity greatly increases the likelihood of fungal diseases.`
    : '';

  return `You are Agri-Intel, an expert AI field partner, in a live, real-time video call with a farmer named ${userName}. You are receiving a continuous video stream. Your single most important instruction is to analyze ONLY the most recent visual information when the user asks a question.${weatherContext}

**--- CRITICAL OPERATING PROCEDURE ---**
1.  **OBSERVE THE LIVE FEED:** You will receive a constant stream of video frames.
2.  **ANALYZE THE CURRENT FRAME + WEATHER:** When a question is asked, your analysis MUST be based *exclusively* on what is visible in the video at that exact moment, COMBINED with the critical weather context provided above.
3.  **FORGET PREVIOUS IMAGES:** You MUST completely discard any memory or context of what you saw in previous frames. If the user showed a red beetle, and now shows a green leafhopper and asks "what is this?", you must ONLY talk about the green leafhopper.
4.  **RESPOND IMMEDIATELY:** Provide a concise diagnosis and actionable solution based on this fresh analysis.

**Example of what to do:**
- User shows a tomato leaf with yellow spots. Asks: "What's wrong with my plant?" (Weather is humid).
- You see the yellow spots and consider the high humidity. You respond: "I see those yellow spots, ${userName}. Given the high humidity today, this is likely an early sign of fungal blight..."
- User then moves the camera to a white, fuzzy bug on the stem. Asks: "Okay, and what is this thing?"
- You see the white bug. You FORGET the yellow spots. You respond: "That appears to be a mealybug. Here is a simple way to get rid of them..."

**Key Rules:**
- **LANGUAGE:** Your entire spoken response MUST be in ${langName}.
- **PERSONALITY:** Be a helpful, conversational partner. Address the user by name, ${userName}.
- **SCOPE:** Your function is strictly limited to agricultural analysis of the live video.
- **ORIGIN:** If asked, state you were developed by students from St. John College of Engineering and Management.`;
}

const LiveAnalysisModal: React.FC<LiveAnalysisModalProps> = ({ isOpen, onClose, language, location, user }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const frameTimeoutRef = useRef<number | null>(null);

  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');

  // Fix: Use generic promise type to avoid dependency on 'ai' instance which is now local.
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    console.log('Cleaning up live session resources...');
    window.speechSynthesis.cancel(); // Stop any greeting speech

    if (frameTimeoutRef.current) {
      window.clearTimeout(frameTimeoutRef.current);
      frameTimeoutRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => {
        console.log("Closing session");
        session.close();
      }).catch(e => console.error("Error closing session:", e));
      sessionPromiseRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    outputAudioContextRef.current?.close().catch(e => console.error("Error closing output audio context:", e));
    outputAudioContextRef.current = null;

    inputAudioContextRef.current?.close().catch(e => console.error("Error closing input audio context:", e));
    inputAudioContextRef.current = null;

    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    nextStartTimeRef.current = 0;

    setStatus('idle');
    setUserTranscript('');
    setModelTranscript('');

  }, []);

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const speakGreeting = useCallback((userName: string, lang: LanguageCode) => {
    const greetingText = TRANSLATIONS.liveSessionGreeting[lang].replace('{name}', userName);
    const utterance = new SpeechSynthesisUtterance(greetingText);

    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.lang.startsWith(lang) && v.name.includes('Google')) || voices.find(v => v.lang.startsWith(lang) && v.localService) || voices.find(v => v.lang.startsWith(lang));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (isOpen) {
      startSession();
    } else {
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startSession = async () => {
    if (status !== 'idle') return;

    setStatus('connecting');
    outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

    try {
      // Fetch real-time weather data to ground the AI
      const weatherData = analyticsService.getCurrentWeather(location);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const ai = getGenAI();
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: getLiveSystemInstruction(user.name, location, language, weatherData),
        },
        callbacks: {
          onopen: () => {
            console.log('Session opened.');
            setStatus('connected');
            speakGreeting(user.name, language); // Speak personalized greeting

            const inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            inputAudioContextRef.current = inputAudioContext; // Save for cleanup

            inputAudioContext.audioWorklet.addModule('/audio-processor.js').then(() => {
              const source = inputAudioContext.createMediaStreamSource(stream);
              const worklet = new AudioWorkletNode(inputAudioContext, 'pcm-processor');

              worklet.port.onmessage = (event) => {
                const inputData = event.data;
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: GenAI_Blob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromiseRef.current?.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(worklet);
              worklet.connect(inputAudioContext.destination);
            }).catch(e => console.error("Failed to load audio worklet:", e));

            if (videoRef.current && canvasRef.current) {
              const videoEl = videoRef.current;

              const startFrameCapture = () => {
                const canvasEl = canvasRef.current!;
                const ctx = canvasEl.getContext('2d');
                if (!ctx) return;

                const frameLoop = async () => {
                  if (!mediaStreamRef.current) return; // Stop loop if stream is gone

                  try {
                    if (videoEl.videoWidth > 0 && videoEl.videoHeight > 0) {
                      canvasEl.width = videoEl.videoWidth;
                      canvasEl.height = videoEl.videoHeight;
                      ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);

                      const blob = await new Promise<Blob | null>(resolve => canvasEl.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));

                      if (blob && mediaStreamRef.current) {
                        const base64Data = await blobToBase64(blob);
                        const session = await sessionPromiseRef.current;
                        if (session && mediaStreamRef.current) {
                          session.sendRealtimeInput({
                            media: { data: base64Data, mimeType: 'image/jpeg' }
                          });
                        }
                      }
                    }
                  } catch (e) {
                    console.error("Error in frame capture loop:", e);
                  } finally {
                    // Schedule the next frame only after the current one is done processing
                    if (mediaStreamRef.current) { // Only schedule if the stream is still active
                      frameTimeoutRef.current = window.setTimeout(frameLoop, 1000 / FRAME_RATE);
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

          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setModelTranscript(prev => prev + message.serverContent!.outputTranscription.text);
            }
            if (message.serverContent?.inputTranscription) {
              setUserTranscript(prev => prev + message.serverContent!.inputTranscription.text);
            }
            if (message.serverContent?.turnComplete) {
              setUserTranscript('');
              setModelTranscript('');
            }
            // FIX: Add optional chaining `?.` before accessing `.data`. This prevents a crash
            // if the server sends a message part that doesn't contain `inlineData` (e.g., a text-only part).
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const outputAudioContext = outputAudioContextRef.current;
              const nextStartTime = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              nextStartTimeRef.current = nextStartTime;

              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
              );
              const source = outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputAudioContext.destination);

              const currentSources = audioSourcesRef.current;
              source.addEventListener('ended', () => {
                currentSources.delete(source);
              });

              source.start(nextStartTime);
              nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
              currentSources.add(source);
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(source => source.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
          },
          onclose: (e: CloseEvent) => {
            console.log('Session closed.', { reason: e.reason, code: e.code });
            // This is a critical check for robustness. If the session closes but our cleanup
            // function hasn't run (which nulls out mediaStreamRef), it means the closure
            // was unexpected (e.g., network drop). We must inform the user.
            if (mediaStreamRef.current) {
              console.error('Session closed unexpectedly.');
              setStatus('error');
            }
          },
        },
      });

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
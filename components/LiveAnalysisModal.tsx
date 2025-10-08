import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenaiBlob } from '@google/genai';
import type { LanguageCode } from '../types';
import { TRANSLATIONS } from '../constants';
import BotIcon from './icons/BotIcon';
import UserIcon from './icons/UserIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import CheckIcon from './icons/CheckIcon';

// --- Global AI Instance ---
// The API key is now read from the global window object, where it's placed by config.js at runtime.
declare global {
    interface Window {
        KISSAN_MITRA_API_KEY: string;
    }
}
const apiKey = window.KISSAN_MITRA_API_KEY || process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey });


// --- Icon Component ---
const CameraSwitchIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20a8 8 0 008-8h-3a5 5 0 01-5 5v3zM4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z" />
    </svg>
);


// --- Audio Utility Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(i);
  }
  return btoa(binary);
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

function createBlob(data: Float32Array): GenaiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const getLiveSystemInstruction = (language: LanguageCode, location: string): string => {
    return `You are a world-class agronomist, "Kissan Mitra," conducting a LIVE, REAL-TIME video field inspection. The user is a farmer in ${location}, Kerala. Your primary goal is SPEED and IMMEDIATE feedback. Your instructions are CRITICAL:
1.  **REAL-TIME, PROACTIVE ANALYSIS:** Your analysis must be instant. Continuously analyze the video feed. DO NOT wait for the farmer. If you see a potential problem (yellow leaves, spots, pests), point it out IMMEDIATELY. Start with phrases like "I see..." or "That looks like...". Prioritize speed over long explanations.
2.  **QUICK DIAGNOSIS & ACTIONABLE SOLUTIONS:** When you identify an issue, your response MUST be structured for fast delivery.
    -   State the diagnosis clearly and concisely (e.g., "That's Leaf Spot disease on the banana plant.").
    -   IMMEDIATELY provide brief, bullet-pointed solutions under two headers: **Organic Methods** and **Chemical Methods**. Be specific but quick. (e.g., "Organic: Neem oil spray. Chemical: Mancozeb fungicide.")
    -   Conclude with a very brief safety warning: "Consult your Krishi Bhavan for chemical safety."
3.  **INTERACTIVE & DIRECT:** This is a live call. Be direct. If the video is unclear, ask simple questions ("Closer, please." or "Show me the underside of the leaf."). Connect what you see and hear instantly.
4.  **LANGUAGE & TONE:** You MUST speak in the language for code: ${language}. Your tone is helpful but URGENT and to the point, like an expert in the field with limited time. Short, clear sentences are essential.`;
};


// --- Component ---
interface LiveAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  location: string;
}

type Status = 'idle' | 'connecting' | 'listening' | 'speaking' | 'analyzing' | 'error' | 'permission';
type TranscriptEntry = { speaker: 'user' | 'model'; text: string };

const LiveAnalysisModal: React.FC<LiveAnalysisModalProps> = ({ isOpen, onClose, language, location }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionPromiseRef = useRef<ReturnType<typeof ai.live.connect> | null>(null);
  
  const [status, setStatus] = useState<Status>('idle');
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [transcriptLog, setTranscriptLog] = useState<TranscriptEntry[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [currentModelOutput, setCurrentModelOutput] = useState('');

  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  
  const isNewTurnByUserRef = useRef(true);

  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const stopSession = useCallback(() => {
    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close()).catch(console.error);
      sessionPromiseRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setStatus('idle');
  }, []);

  const startSession = useCallback(async () => {
    if (status !== 'idle' || !streamRef.current) return;
    setStatus('connecting');
    isNewTurnByUserRef.current = true;
    setCurrentUserInput('');
    setCurrentModelOutput('');
    setTranscriptLog([]);

    try {
      inputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('analyzing'); // Start in analyzing mode
            const stream = streamRef.current!;
            const inputAudioContext = inputAudioContextRef.current!;
            
            mediaStreamSourceRef.current = inputAudioContext.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContext.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContext.destination);

            const canvasEl = canvasRef.current!;
            const videoEl = videoRef.current!;
            const ctx = canvasEl.getContext('2d')!;
            frameIntervalRef.current = window.setInterval(() => {
              canvasEl.width = videoEl.videoWidth;
              canvasEl.height = videoEl.videoHeight;
              ctx.drawImage(videoEl, 0, 0, videoEl.videoWidth, videoEl.videoHeight);
              canvasEl.toBlob(
                async (blob) => {
                  if (blob) {
                    const base64Data = await blobToBase64(blob);
                    sessionPromiseRef.current?.then((session) => {
                      session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                    });
                  }
                }, 'image/jpeg', 0.5);
            }, 200);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              setStatus('listening');
              if (isNewTurnByUserRef.current) {
                isNewTurnByUserRef.current = false;
                // The user started speaking, so the AI's last turn is complete. Log it.
                setCurrentModelOutput(prevOutput => {
                    if(prevOutput) {
                        setTranscriptLog(prevLog => [...prevLog, { speaker: 'model', text: prevOutput }]);
                    }
                    return ''; // Reset for the next turn
                });
              }
              setCurrentUserInput(prev => prev + message.serverContent.inputTranscription.text);
            }

            if (message.serverContent?.outputTranscription) {
              setStatus('speaking');
              // The AI started speaking, so the user's turn is complete. Log it.
              setCurrentUserInput(prevInput => {
                if(prevInput) {
                    setTranscriptLog(prevLog => [...prevLog, { speaker: 'user', text: prevInput }]);
                }
                return ''; // Reset for the next turn
              });
              setCurrentModelOutput(prev => prev + message.serverContent.outputTranscription.text);
            }

            if (message.serverContent?.turnComplete) {
              isNewTurnByUserRef.current = true;
              setStatus('analyzing');
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const audioCtx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), audioCtx, 24000, 1);
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Session error:', e);
            setStatus('error');
            stopSession();
          },
          onclose: () => {
            stopSession();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: getLiveSystemInstruction(language, location),
        },
      });
      await sessionPromiseRef.current;
    } catch(err) {
        console.error("Failed to start session:", err);
        setStatus('error');
        stopSession();
    }
  }, [language, location, status, stopSession]);
  
  const fullCleanup = useCallback(() => {
    stopSession();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    inputAudioContextRef.current?.close().catch(console.error);
    outputAudioContextRef.current?.close().catch(console.error);
    inputAudioContextRef.current = null;
    outputAudioContextRef.current = null;
    nextStartTimeRef.current = 0;
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  }, [stopSession]);

  useEffect(() => {
    const initMedia = async () => {
      if (isOpen) {
        setStatus('connecting');
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: cameraFacingMode } });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.error("Video play failed:", e));
          }
          setStatus('idle');
        } catch (err) {
          console.error("Failed to get media devices:", err);
          setStatus((err as Error).name === 'NotAllowedError' ? 'permission' : 'error');
        }
      } else {
        fullCleanup();
      }
    };
    initMedia();
    return () => {
      fullCleanup();
    };
  }, [isOpen, fullCleanup, cameraFacingMode]);

  const handleCameraSwitch = async () => {
    if (!streamRef.current || !navigator.mediaDevices?.enumerateDevices) return;

    const videoDevices = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === "videoinput"
    );
    if (videoDevices.length < 2) {
        console.log("Only one camera found, cannot switch.");
        return;
    }

    const newFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    
    streamRef.current.getVideoTracks().forEach(track => track.stop());
    
    try {
        const newStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: newFacingMode }
        });
        const newVideoTrack = newStream.getVideoTracks()[0];
        
        const oldVideoTrack = streamRef.current.getVideoTracks()[0];
        if (oldVideoTrack) {
          streamRef.current.removeTrack(oldVideoTrack);
        }
        streamRef.current.addTrack(newVideoTrack);
        
        if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }

        setCameraFacingMode(newFacingMode);
    } catch (err) {
        console.error("Failed to switch camera:", err);
    }
  };

  const handleToggleSession = () => {
    if (status === 'idle') {
      startSession();
    } else {
      stopSession();
    }
  };

  const handleClose = () => {
    fullCleanup();
    onClose();
  };
  
  const StatusIndicator = () => {
    const statusMap = {
        idle: { text: TRANSLATIONS.statusIdle[language], color: 'bg-gray-400' },
        connecting: { text: TRANSLATIONS.statusConnecting[language], color: 'bg-yellow-400 animate-pulse' },
        listening: { text: TRANSLATIONS.statusListening[language], color: 'bg-green-400 animate-pulse' },
        speaking: { text: TRANSLATIONS.statusSpeaking[language], color: 'bg-blue-400 animate-pulse' },
        analyzing: { text: 'Analyzing...', color: 'bg-purple-400 animate-pulse-slow' },
        error: { text: TRANSLATIONS.statusError[language], color: 'bg-red-500' },
        permission: { text: TRANSLATIONS.statusPermission[language], color: 'bg-red-500' },
    };
    const { text, color } = statusMap[status];
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-white font-medium p-2 bg-black/40 backdrop-blur-sm rounded-full">
          <span className={`w-3 h-3 rounded-full ${color}`}></span>
          <span>{text}</span>
      </div>
    );
  };
  
  const renderOverlayContent = () => {
    if (status !== 'idle') return null;
    
    const tips = [
        "Ensure good lighting on your crop.",
        "Get close to the plant for detailed analysis.",
        "Speak clearly into the microphone."
    ];

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <VideoCameraIcon className="w-16 h-16 mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold">{TRANSLATIONS.liveSessionTitle[language]}</h3>
            <div className="mt-4 text-left text-gray-300 text-sm space-y-2 max-w-sm">
                <p className="font-semibold text-center mb-2">For best results:</p>
                {tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <CheckIcon />
                        <span>{tip}</span>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  if (!isOpen) return null;

  const isSessionActive = status !== 'idle' && status !== 'connecting' && status !== 'permission' && status !== 'error';

  return (
    <div className="fixed inset-0 z-50 bg-[#0D1117]" aria-modal="true" role="dialog">
      <div className="flex flex-col h-full w-full text-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        <header className="flex-shrink-0 flex items-center justify-between p-4">
          <h2 className="text-lg font-bold">{TRANSLATIONS.liveSessionTitle[language]}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>

        <main className="flex-1 flex flex-col p-4 pt-0 gap-4 overflow-hidden">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    {renderOverlayContent()}
                </div>
                {isSessionActive && (
                  <div className="absolute top-3 left-3 right-3 flex justify-center">
                      <StatusIndicator />
                  </div>
                )}
                <div className="absolute bottom-3 right-3">
                    <button 
                        onClick={handleCameraSwitch} 
                        className="p-3 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
                        title="Switch camera"
                        aria-label="Switch camera"
                    >
                        <CameraSwitchIcon />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 bg-[#161B22] border border-gray-700 rounded-2xl p-4 overflow-y-auto space-y-4 text-sm">
                {!isSessionActive && status === 'idle' ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Conversation log will appear here.</p>
                  </div>
                ) : (
                  <>
                    {transcriptLog.map((entry, index) => (
                      <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'model' ? 'text-green-300' : 'text-gray-300'}`}>
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${entry.speaker === 'model' ? 'bg-green-600' : 'bg-gray-600'}`}>
                            {entry.speaker === 'model' ? <BotIcon /> : <UserIcon />}
                          </div>
                          <p className="flex-1 pt-1.5">{entry.text}</p>
                      </div>
                    ))}
                    {currentUserInput && (
                      <div className="flex items-start gap-3 text-gray-200">
                          <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center"><UserIcon /></div>
                              {status === 'listening' && <span className="absolute top-0 left-0 w-full h-full rounded-full bg-green-500 opacity-75 animate-ping"></span>}
                          </div>
                          <p className="flex-1 pt-1.5">{currentUserInput}...</p>
                      </div>
                    )}
                    {currentModelOutput && (
                      <div className="flex items-start gap-3 text-green-200">
                           <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center"><BotIcon /></div>
                              {status === 'speaking' && <span className="absolute top-0 left-0 w-full h-full rounded-full bg-blue-500 opacity-75 animate-ping"></span>}
                          </div>
                          <p className="flex-1 pt-1.5">{currentModelOutput}...</p>
                      </div>
                    )}
                  </>
                )}
            </div>
        </main>
        
        <footer className="flex-shrink-0 p-4 pt-0">
            <button
                onClick={handleToggleSession}
                disabled={status === 'connecting' || status === 'permission' || status === 'error'}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${
                    isSessionActive 
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/20' 
                    : 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20'
                }`}
            >
                {isSessionActive ? TRANSLATIONS.stopSession[language] : TRANSLATIONS.startSession[language]}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default LiveAnalysisModal;
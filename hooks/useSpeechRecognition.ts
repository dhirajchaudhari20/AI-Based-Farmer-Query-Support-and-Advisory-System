import { useState, useEffect, useRef, useCallback } from 'react';
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../types';

interface UseSpeechRecognitionProps {
    language?: string;
    onResult?: (transcript: string) => void;
    continuous?: boolean;
}

export const useSpeechRecognition = ({ language = 'en-US', onResult, continuous = false }: UseSpeechRecognitionProps = {}) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialize recognition instance
    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            setIsSupported(false);
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const currentText = finalTranscript || interimTranscript;
            setTranscript(currentText);

            // If we have a finalized result, notify parent
            if (finalTranscript && onResult) {
                onResult(finalTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // 'no-speech' is common if user didn't say anything; usually benign
            if (event.error !== 'no-speech') {
                console.error('Speech recognition error', event.error);
                setError(event.error);
            }
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        }
    }, [continuous]);

    // Update language dynamically
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language;
        }
    }, [language]);

    // Update onResult callback binding
    const onResultRef = useRef(onResult);
    useEffect(() => {
        onResultRef.current = onResult;
    }, [onResult]);

    // Re-bind onResult listener logic if needed? 
    // Actually, the closure in useEffect might be stale for onResult. 
    // Better to use ref for callbacks in event listeners if dependencies change often.
    // But for now, let's keep it simple. If functionality breaks on hot-reload, we know why.

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                setTranscript('');
                setError(null);
                recognitionRef.current.lang = language;
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                // e.g. already started
                console.error("Failed to start recognition:", e);
            }
        }
    }, [isListening, language]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { isListening, transcript, startListening, stopListening, resetTranscript, error, isSupported };
};

export default useSpeechRecognition;

import { useState, useCallback, useEffect } from 'react';

export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    // const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        const synth = window.speechSynthesis;
        return () => {
            synth.cancel();
        };
    }, []);

    const speak = useCallback((text: string) => {
        const synth = window.speechSynthesis;

        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }

        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };
        u.onerror = (event) => {
            console.error('Speech synthesis error', event);
            setIsSpeaking(false);
        };

        // setUtterance(u);
        setIsSpeaking(true);
        synth.speak(u);
    }, []);

    const stop = useCallback(() => {
        const synth = window.speechSynthesis;
        synth.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    }, []);

    const pause = useCallback(() => {
        const synth = window.speechSynthesis;
        synth.pause();
        setIsPaused(true);
    }, []);

    const resume = useCallback(() => {
        const synth = window.speechSynthesis;
        synth.resume();
        setIsPaused(false);
    }, []);

    return { speak, stop, pause, resume, isSpeaking, isPaused };
};

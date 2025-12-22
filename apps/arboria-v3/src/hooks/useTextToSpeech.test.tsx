import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTextToSpeech } from './useTextToSpeech';

describe.skip('useTextToSpeech', () => {
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    const mockPause = vi.fn();
    const mockResume = vi.fn();

    beforeEach(() => {
        // Mock SpeechSynthesis
        const mockSpeechSynthesis = {
            speak: mockSpeak,
            cancel: mockCancel,
            pause: mockPause,
            resume: mockResume,
            paused: false,
            speaking: false,
            getVoices: () => [],
            onvoiceschanged: null,
            pending: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        };

        // Use stubGlobal for Vitest
        vi.stubGlobal('speechSynthesis', mockSpeechSynthesis);

        // Also mock window.speechSynthesis explicitly just in case
        Object.defineProperty(window, 'speechSynthesis', {
            value: mockSpeechSynthesis,
            writable: true,
            configurable: true,
        });

        // Mock SpeechSynthesisUtterance
        const MockUtterance = vi.fn().mockImplementation(() => ({
            text: '',
            rate: 1,
            pitch: 1,
            voice: null,
            onend: null,
            onerror: null,
            lang: '',
            volume: 1,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));

        vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance);
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    it('should speak text', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.speak('Hello World');
        });

        expect(mockSpeak).toHaveBeenCalled();
        expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('Hello World');
    });

    it('should cancel speech', () => {
        const { result } = renderHook(() => useTextToSpeech());

        act(() => {
            result.current.stop();
        });

        expect(mockCancel).toHaveBeenCalled();
    });
});

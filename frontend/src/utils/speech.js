/**
 * Utility for Web Speech API integration (Voice Input/Output).
 */

export const isSpeechRecognitionSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const isSpeechSynthesisSupported = () => {
    return 'speechSynthesis' in window;
};

export const startListening = (onResult, onError, language = 'en-US') => {
    if (!isSpeechRecognitionSupported()) {
        if (onError) onError(new Error("Speech recognition not supported in this browser."));
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onResult) onResult(transcript);
    };

    recognition.onerror = (event) => {
        if (onError) onError(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.start();
    return recognition;
};

export const speak = (text, language = 'en-US') => {
    if (!isSpeechSynthesisSupported()) {
        console.warn("Speech synthesis not supported in this browser.");
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Optional: Try to find a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (voice) {
        utterance.voice = voice;
    }

    window.speechSynthesis.speak(utterance);
};

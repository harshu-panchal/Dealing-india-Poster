import React, { useState, useEffect } from 'react';
import { Search, Mic, MicOff, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ value, onChange, placeholder, className = "" }) => {
  const { t } = useTranslation();
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // You might want to make this dynamic based on i18n

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className={`bg-[#f1f5f9] rounded-full px-4 py-2.5 lg:px-6 lg:py-3 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${className}`}>
      <Search className="text-[#64748b] lg:w-5 lg:h-5" size={18} />
      <input 
        type="text" 
        placeholder={placeholder || t("searchPosters")} 
        className="flex-1 border-none bg-transparent outline-none text-[0.95rem] lg:text-base"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button 
        onClick={startListening}
        className={`transition-all duration-300 ${isListening ? 'text-red-600 scale-125 animate-pulse' : 'text-[#64748b] hover:text-[#ef4444]'}`}
      >
        {isListening ? <Loader2 size={18} className="animate-spin" /> : <Mic size={18} className="lg:w-5 lg:h-5" />}
      </button>
    </div>
  );
};

export default SearchBar;

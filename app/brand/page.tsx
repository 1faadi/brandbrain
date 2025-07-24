'use client';

import { useChat } from 'ai/react';
import { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Crown, Settings, Sun, Moon } from 'lucide-react';

interface BrandVariables {
  brandName: string;
  brandVoice: string;
  targetAudience: string;
  brandValues: string;
  brandPersonality: string;
  communicationStyle: string;
  keyMessages: string;
  brandPromise: string;
  competitiveDifferentiator: string;
  brandMission: string;
  preferredTone: string;
  industryFocus: string;
}

export default function BrandChat() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Start with completely empty variables - no defaults
  const [brandVariables, setBrandVariables] = useState<BrandVariables>({
    brandName: '',
    brandVoice: '',
    targetAudience: '',
    brandValues: '',
    brandPersonality: '',
    communicationStyle: '',
    keyMessages: '',
    brandPromise: '',
    competitiveDifferentiator: '',
    brandMission: '',
    preferredTone: '',
    industryFocus: ''
  });

  const [isLoadingVariables, setIsLoadingVariables] = useState(true);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error
  } = useChat({
    api: '/api/brand',
    body: {
      brandVariables
    },
    onResponse: (response) => {
      console.log('Response received:', response);
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (message) => {
      console.log('Message finished:', message);
    }
  });

  const ref = useRef<HTMLDivElement>(null);

  // Load brand variables on component mount
  useEffect(() => {
    const loadBrandVariables = async () => {
      try {
        setIsLoadingVariables(true);
        console.log('Loading brand variables...');
        
        const response = await fetch(`/api/brand-variables`);
        const data = await response.json();

        console.log('Loaded data:', data);

        if (data.success && data.variables && Object.keys(data.variables).length > 0) {
          console.log('Setting brand variables:', data.variables);
          setBrandVariables(data.variables);
        } else {
          console.log('No brand variables found in database');
        }
      } catch (error) {
        console.error('Error loading brand variables:', error);
      } finally {
        setIsLoadingVariables(false);
      }
    };

    loadBrandVariables();
  }, []);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Helper to check if any brand variables are set
  const hasBrandVariables = Object.values(brandVariables).some(value => value.trim() !== '');

  // Theme classes
  const themeClasses = {
    background: isDarkMode 
      ? 'bg-gray-900' 
      : 'bg-gray-50',
    cardBackground: isDarkMode 
      ? 'bg-gray-800 border-gray-700' 
      : 'bg-white border-gray-200',
    headerBackground: isDarkMode 
      ? 'bg-gray-800/90 border-gray-700' 
      : 'bg-white/90 border-gray-200',
    inputBackground: isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    },
    userMessage: isDarkMode 
      ? 'bg-blue-600 text-white' 
      : 'bg-blue-600 text-white',
    aiMessage: isDarkMode 
      ? 'bg-gray-700 text-gray-100 border-gray-600' 
      : 'bg-white text-gray-900 border-gray-200',
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
    },
    accent: isDarkMode 
      ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' 
      : 'bg-blue-50 border-blue-200 text-blue-700'
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-300`}>
      <div className="flex flex-col h-screen mx-auto">

        {/* Header */}
        <div className={`${themeClasses.headerBackground} backdrop-blur-sm border-b p-6 transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${themeClasses.accent} rounded-lg transition-colors duration-300`}>
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${themeClasses.text.primary} transition-colors duration-300`}>
                  {brandVariables.brandName || 'Brand Brain Assistant'}
                </h1>
                <p className={`text-sm ${themeClasses.text.secondary} transition-colors duration-300`}>
                  {isLoadingVariables 
                    ? 'Loading brand configuration...' 
                    : 'Your strategic brand intelligence partner'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 ${themeClasses.button.secondary} border rounded-lg transition-all duration-200`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <a
                href="/brand-variables"
                className={`${themeClasses.accent} px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 border`}
              >
                <Settings className="w-4 h-4" />
                Manage Variables
              </a>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              <strong>Error:</strong> {error.message}
            </div>
          )}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${themeClasses.accent} rounded-full mb-4 transition-colors duration-300`}>
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-semibold ${themeClasses.text.primary} mb-2 transition-colors duration-300`}>
                Welcome to {brandVariables.brandName || 'Brand Brain'}
              </h3>
              <p className={`${themeClasses.text.secondary} max-w-md mx-auto mb-4 transition-colors duration-300`}>
                Ask me about brand strategy, tone, messaging, slogans, or any creative direction you need guidance on.
              </p>
              
              {isLoadingVariables ? (
                <div className={`inline-flex items-center gap-2 ${themeClasses.text.muted} text-sm transition-colors duration-300`}>
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading your brand configuration...
                </div>
              ) : !hasBrandVariables ? (
                <div className={`inline-flex items-center gap-2 ${themeClasses.accent} text-sm px-4 py-2 rounded-lg border transition-colors duration-300`}>
                  <Settings className="w-4 h-4" />
                  <a href="/brand-variables" className="hover:underline">
                    Set up your brand variables for personalized responses
                  </a>
                </div>
              ) : (
                <div className={`${themeClasses.accent} text-sm px-4 py-2 rounded-lg border transition-colors duration-300`}>
                  ✅ Brand variables loaded - ready for personalized responses
                </div>
              )}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-5 py-3 ${
                m.role === 'user'
                  ? `${themeClasses.userMessage} ml-12`
                  : `${themeClasses.aiMessage} mr-12 border`
              } transition-colors duration-300`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    m.role === 'user' 
                      ? 'text-blue-100' 
                      : isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    {m.role === 'user' ? 'You' : (brandVariables.brandName ? `${brandVariables.brandName} AI` : 'Brand AI')}
                  </span>
                </div>
                <div className="text-sm leading-relaxed">
                  {m.content || (
                    <span className={`${themeClasses.text.muted} italic transition-colors duration-300`}>
                      No response received
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className={`${themeClasses.aiMessage} rounded-lg px-5 py-3 mr-12 border transition-colors duration-300`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {brandVariables.brandName ? `${brandVariables.brandName} AI` : 'Brand AI'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className={`text-xs ${themeClasses.text.muted} ml-2 transition-colors duration-300`}>
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={ref} />
        </div>

        {/* Input Form */}
        <div className={`p-6 ${themeClasses.headerBackground} border-t transition-colors duration-300`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                className={`w-full ${themeClasses.inputBackground} px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                value={input}
                onChange={handleInputChange}
                placeholder={`Ask about ${brandVariables.brandName || 'your brand'} strategy, tone, messaging...`}
                disabled={isLoading}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e as any);
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isLoading || !input.trim()}
              className={`${themeClasses.button.primary} px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <Send size={18} />
            </button>
          </div>

          <div className={`flex items-center justify-center gap-4 mt-3 text-xs ${themeClasses.text.muted} transition-colors duration-300`}>
            <span>Powered by AI</span>
            <span>•</span>
            <span>
              {hasBrandVariables 
                ? `Customized for ${brandVariables.brandName || 'your brand'}` 
                : 'Generic Brand Intelligence'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Save, RotateCcw, Crown, MessageSquare, Users, Target, Building, ArrowLeft, CheckCircle, AlertCircle, Loader, Star, Sun, Moon } from 'lucide-react';

interface BrandVariables {
  // Brand Foundation (Required: brandName)
  brandName: string;
  brandMission: string;
  brandValues: string;
  brandPromise: string;
  
  // Brand Voice & Communication
  brandVoice: string;
  brandPersonality: string;
  preferredTone: string;
  communicationStyle: string;
  
  // Target Market & Positioning
  targetAudience: string;
  keyMessages: string;
  competitiveDifferentiator: string;
  industryFocus: string;
  
  // Additional Brand Details
  brandTagline: string;
  brandArchetype: string;
  doNotSay: string;
  brandGuidelines: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  fields: Array<{
    key: keyof BrandVariables;
    label: string;
    placeholder: string;
    required?: boolean;
    rows?: number;
  }>;
}

export default function BrandVariablesPage() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [brandVariables, setBrandVariables] = useState<BrandVariables>({
    // Brand Foundation
    brandName: '',
    brandMission: '',
    brandValues: '',
    brandPromise: '',
    
    // Brand Voice & Communication
    brandVoice: '',
    brandPersonality: '',
    preferredTone: '',
    communicationStyle: '',
    
    // Target Market & Positioning
    targetAudience: '',
    keyMessages: '',
    competitiveDifferentiator: '',
    industryFocus: '',
    
    // Additional Brand Details
    brandTagline: '',
    brandArchetype: '',
    doNotSay: '',
    brandGuidelines: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['foundation']));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const sections: Section[] = [
    {
      id: 'foundation',
      title: 'Brand Foundation',
      description: 'Core identity and fundamental brand elements',
      icon: <Crown className="w-5 h-5" />,
      fields: [
        { key: 'brandName', label: 'Brand Name', placeholder: 'Your brand name', required: true, rows: 1 },
        { key: 'brandMission', label: 'Mission Statement', placeholder: 'What is your brand\'s purpose and mission?', rows: 3 },
        { key: 'brandValues', label: 'Core Values', placeholder: 'What principles guide your brand? (e.g., Innovation, integrity, excellence)', rows: 3 },
        { key: 'brandPromise', label: 'Brand Promise', placeholder: 'What do you promise to deliver to customers?', rows: 2 }
      ]
    },
    {
      id: 'voice',
      title: 'Voice & Communication',
      description: 'How your brand speaks and communicates',
      icon: <MessageSquare className="w-5 h-5" />,
      fields: [
        { key: 'brandVoice', label: 'Brand Voice', placeholder: 'How does your brand speak? (e.g., Professional yet friendly)', rows: 2 },
        { key: 'brandPersonality', label: 'Brand Personality', placeholder: 'Personality traits (e.g., Trustworthy, innovative, approachable)', rows: 2 },
        { key: 'preferredTone', label: 'Preferred Tone', placeholder: 'Tone for communications (e.g., Confident yet humble, informative)', rows: 2 },
        { key: 'communicationStyle', label: 'Communication Style', placeholder: 'Style of communication (e.g., Clear, concise, engaging)', rows: 2 }
      ]
    },
    {
      id: 'market',
      title: 'Market & Positioning',
      description: 'Target audience and competitive positioning',
      icon: <Target className="w-5 h-5" />,
      fields: [
        { key: 'targetAudience', label: 'Target Audience', placeholder: 'Who is your main target audience? Include demographics and characteristics', rows: 3 },
        { key: 'keyMessages', label: 'Key Messages', placeholder: 'Main messages you want to convey to your audience', rows: 3 },
        { key: 'competitiveDifferentiator', label: 'Competitive Advantage', placeholder: 'What sets you apart from competitors?', rows: 3 },
        { key: 'industryFocus', label: 'Industry Focus', placeholder: 'Primary industry or sector (e.g., Technology, Healthcare, Finance)', rows: 2 }
      ]
    },
    {
      id: 'details',
      title: 'Additional Details',
      description: 'Extended brand guidelines and specifics',
      icon: <Building className="w-5 h-5" />,
      fields: [
        { key: 'brandTagline', label: 'Brand Tagline', placeholder: 'Memorable tagline or slogan', rows: 1 },
        { key: 'brandArchetype', label: 'Brand Archetype', placeholder: 'Brand archetype (e.g., The Expert, The Hero, The Innovator)', rows: 1 },
        { key: 'doNotSay', label: 'Words to Avoid', placeholder: 'Words or phrases your brand should never use', rows: 2 },
        { key: 'brandGuidelines', label: 'Additional Guidelines', placeholder: 'Any other specific brand guidelines or preferences', rows: 3 }
      ]
    }
  ];

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
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500',
    text: {
      primary: isDarkMode ? 'text-white' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500'
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: isDarkMode 
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
    },
    accent: isDarkMode 
      ? 'bg-blue-600/20 border-blue-500/30 text-blue-300' 
      : 'bg-blue-50 border-blue-200 text-blue-700',
    success: isDarkMode 
      ? 'text-green-400' 
      : 'text-green-600',
    error: isDarkMode 
      ? 'text-red-400' 
      : 'text-red-600',
    warning: isDarkMode 
      ? 'bg-amber-900/20 border-amber-700/30 text-amber-300' 
      : 'bg-amber-50 border-amber-200 text-amber-800'
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [brandVariables, hasUnsavedChanges]);

  useEffect(() => {
    loadBrandVariables();
  }, []);

  const loadBrandVariables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/brand-variables`);
      const data = await response.json();
      
      if (data.success && data.variables && Object.keys(data.variables).length > 0) {
        setBrandVariables(prev => ({
          ...prev,
          ...data.variables
        }));
      }
    } catch (error) {
      console.error('Error loading brand variables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariableChange = (key: keyof BrandVariables, value: string) => {
    setBrandVariables(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
    setAutoSaveStatus('idle');
  };

  const handleAutoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      setAutoSaveStatus('saving');
      
      const response = await fetch('/api/brand-variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: brandVariables
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAutoSaveStatus('success');
        setHasUnsavedChanges(false);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Auto-save error:', error);
    }
  };

  const handleManualSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/brand-variables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variables: brandVariables
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setHasUnsavedChanges(false);
        setAutoSaveStatus('success');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } else {
        setAutoSaveStatus('error');
      }
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Manual save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all brand variables? This will clear all your saved brand information and cannot be undone.')) {
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/brand-variables`, {
        method: 'DELETE',
      });

      setBrandVariables({
        brandName: '', brandMission: '', brandValues: '', brandPromise: '',
        brandVoice: '', brandPersonality: '', preferredTone: '', communicationStyle: '',
        targetAudience: '', keyMessages: '', competitiveDifferentiator: '', industryFocus: '',
        brandTagline: '', brandArchetype: '', doNotSay: '', brandGuidelines: ''
      });
      
      setHasUnsavedChanges(false);
      setAutoSaveStatus('success');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
      
    } catch (error) {
      setAutoSaveStatus('error');
      console.error('Error resetting brand variables:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getCompletionStatus = (section: Section) => {
    const filledFields = section.fields.filter(field => 
      brandVariables[field.key] && brandVariables[field.key].trim() !== ''
    ).length;
    return { filled: filledFields, total: section.fields.length };
  };

  const getTotalCompletion = () => {
    const allFields = sections.reduce((acc, section) => acc + section.fields.length, 0);
    const filledFields = sections.reduce((acc, section) => {
      const { filled } = getCompletionStatus(section);
      return acc + filled;
    }, 0);
    return { filled: filledFields, total: allFields };
  };

  const isRequiredFieldFilled = () => {
    return brandVariables.brandName && brandVariables.brandName.trim() !== '';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className={themeClasses.text.secondary}>Loading brand variables...</p>
        </div>
      </div>
    );
  }

  const totalCompletion = getTotalCompletion();

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <a 
              href="/brand"
              className={`p-2 ${themeClasses.cardBackground} border rounded-lg ${themeClasses.text.secondary} hover:bg-opacity-80 transition-all duration-200`}
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-sm">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${themeClasses.text.primary} transition-colors duration-300`}>
                  Brand Variables
                </h1>
                <p className={`${themeClasses.text.secondary} transition-colors duration-300`}>
                  Configure your brand intelligence and voice
                </p>
              </div>
            </div>
            
            <div className="ml-auto">
              <button
                onClick={toggleTheme}
                className={`p-2 ${themeClasses.button.secondary} border rounded-lg transition-all duration-200`}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className={`${themeClasses.cardBackground} border rounded-xl p-6 shadow-sm transition-colors duration-300`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className={`text-sm font-medium ${themeClasses.text.primary} transition-colors duration-300`}>
                    Progress: {totalCompletion.filled}/{totalCompletion.total} fields
                  </div>
                  <div className={`w-32 h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden transition-colors duration-300`}>
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${Math.round((totalCompletion.filled / totalCompletion.total) * 100)}%` }}
                    />
                  </div>
                  <span className={`text-xs ${themeClasses.text.muted} transition-colors duration-300`}>
                    {Math.round((totalCompletion.filled / totalCompletion.total) * 100)}%
                  </span>
                </div>

                {/* Auto-save status */}
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <Loader className="w-4 h-4 animate-spin" />
                      Auto-saving...
                    </div>
                  )}
                  {autoSaveStatus === 'success' && (
                    <div className={`flex items-center gap-2 ${themeClasses.success} text-sm transition-colors duration-300`}>
                      <CheckCircle className="w-4 h-4" />
                      Auto-saved
                    </div>
                  )}
                  {autoSaveStatus === 'error' && (
                    <div className={`flex items-center gap-2 ${themeClasses.error} text-sm transition-colors duration-300`}>
                      <AlertCircle className="w-4 h-4" />
                      Save failed
                    </div>
                  )}
                  {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                    <div className={`text-xs ${themeClasses.text.muted} transition-colors duration-300`}>
                      Unsaved changes
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={resetToDefaults}
                  disabled={isSaving}
                  className={`flex items-center gap-2 px-4 py-2 ${themeClasses.button.secondary} border rounded-lg transition-colors text-sm disabled:opacity-50`}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All
                </button>
                
                <button
                  onClick={handleManualSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className={`flex items-center gap-2 px-6 py-2 ${themeClasses.button.primary} rounded-lg transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSaving ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Now
                </button>
              </div>
            </div>

            {!isRequiredFieldFilled() && (
              <div className={`mt-4 p-3 ${themeClasses.warning} border rounded-lg transition-colors duration-300`}>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4" />
                  <span>Brand Name is required to get started</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {sections.map((section) => {
            const { filled, total } = getCompletionStatus(section);
            const isExpanded = expandedSections.has(section.id);
            const completionPercentage = Math.round((filled / total) * 100);

            return (
              <div key={section.id} className={`${themeClasses.cardBackground} border rounded-xl shadow-sm overflow-hidden transition-colors duration-300`}>
                
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full p-6 text-left hover:bg-opacity-50 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 ${themeClasses.accent} rounded-lg border transition-colors duration-300`}>
                        {section.icon}
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${themeClasses.text.primary} transition-colors duration-300`}>
                          {section.title}
                        </h2>
                        <p className={`${themeClasses.text.secondary} text-sm transition-colors duration-300`}>
                          {section.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className={`text-sm font-medium ${themeClasses.text.primary} transition-colors duration-300`}>
                          {filled}/{total}
                        </div>
                        <div className={`text-xs ${themeClasses.text.muted} transition-colors duration-300`}>
                          {completionPercentage}% complete
                        </div>
                      </div>
                      <div className={`w-16 h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden transition-colors duration-300`}>
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Section Content */}
                {isExpanded && (
                  <div className={`px-6 pb-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} transition-colors duration-300`}>
                    <div className="grid gap-6 mt-6">
                      {section.fields.map((field) => (
                        <div key={field.key}>
                          <label className={`block text-sm font-medium ${themeClasses.text.primary} mb-2 transition-colors duration-300`}>
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            {brandVariables[field.key] && brandVariables[field.key].trim() !== '' && (
                              <CheckCircle className={`w-4 h-4 ${themeClasses.success} inline ml-2 transition-colors duration-300`} />
                            )}
                          </label>
                          <textarea
                            value={brandVariables[field.key]}
                            onChange={(e) => handleVariableChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={field.rows || 2}
                            className={`w-full ${themeClasses.inputBackground} px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none`}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={`mt-8 text-center ${themeClasses.cardBackground} border rounded-xl p-6 shadow-sm transition-colors duration-300`}>
          <p className={`${themeClasses.text.secondary} text-sm mb-4 transition-colors duration-300`}>
            Your brand variables are automatically saved and will be used to provide personalized, brand-consistent responses.
          </p>
          <a 
            href="/brand" 
            className={`inline-flex items-center gap-2 px-4 py-2 ${themeClasses.button.primary} rounded-lg transition-colors font-medium`}
          >
            Start Brand Chat
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
}
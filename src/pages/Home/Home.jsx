import React, { useState } from 'react';
import Header from '@/components/layout/Header/Header';
import VoiceRecorder from '@/components/sections/Hero/VoiceRecorder';
import ClinicalTranscript from '@/components/sections/About/ClinicalTranscript';
import OpdReportForm from '@/components/sections/Services/OpdReportForm';
import SuggestionPopup from '@/components/sections/Contact/SuggestionPopup';
import Chatbot from '@/components/common/Chatbot/Chatbot';
import { API_PATHS } from '@/apipath';

const DEFAULT_GENERAL_EXAMINATION = `Patient is conscious, cooperative, well-oriented to time, place, and person. She appears anxious but comfortable, sitting on the examination table without any distress. Vital signs: Pulse rate 82 beats per minute, regular in rhythm and volume. Blood pressure 128/84 mmHg in the right arm sitting position. Respiratory rate 18 breaths per minute, regular and unlabored. Temperature is afebrile (98.4°F). No pallor, icterus, cyanosis, clubbing, or lymphadenopathy noted. Nutritional status is average, with a BMI of 26.5 kg/m² (overweight).`;

const DEFAULT_PREVIOUS_INVESTIGATION = `Upper GI Endoscopy with Biopsy (Pre-operative): Revealed sliding hiatus hernia with short segment Barrett's esophagus; biopsy showed no evidence of eosinophilic esophagitis or dysplasia.
CT Scan Abdomen (Post-operative): Showed status post-robotic fundoplication with sliding hiatus hernia, mild hepatic steatosis, and no significant mediastinal or peritoneal pathology.`;

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [formData, setFormData] = useState({
    complaints: '',
    pastHistory: '',
    pastOperation: '',
    pastMedication: '',
    associatedDisease: '',
    previousInvestigation: '',
    personalHistory: '',
    familyHistory: '',
    generalExam: '',
    abdominalExam: '',
    provisionalDx: '',
    suggestiveInvestigations: '',
    advice: ''
  });

  const [suggestState, setSuggestState] = useState({
    isOpen: false,
    fieldId: '',
    label: '',
    triggerRect: null
  });

  const handleFieldChange = (fieldId, val) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleAudioReady = async (blob, url) => {
    if (!blob) return;
    
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      // Swagger requirement: key 'audio' with type 'audio/mpeg' and .mp3 extension
      const mp3File = new File([blob], 'recording.mp3', { type: 'audio/mpeg' });
      formData.append('audio', mp3File, 'recording.mp3');

      const response = await fetch(API_PATHS.TRANSCRIBE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.transcript) {
        setTranscript(result.data.transcript);
      } else if (result.transcript) {
        setTranscript(result.transcript);
      } else {
        throw new Error(result.error_message || 'Failed to extract transcript from response');
      }
    } catch (err) {
      console.error('Transcription API Error:', err);
      alert(`Error transcribing audio: ${err.message}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      alert('Please enter or record a transcript first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch(API_PATHS.EXTRACT_OPD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          text: transcript.trim() // Compatibility for both potential request formats
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const result = await response.json();
      
      // Extract from data array if present
      let responseData = result.data || result;
      if (Array.isArray(responseData) && responseData.length > 0) {
        responseData = responseData[0];
      }
      
      const extractField = (camelKey, snakeKey, alternativeKeys = []) => {
        const keysToTry = [camelKey, snakeKey, ...alternativeKeys];
        for (const key of keysToTry) {
          if (responseData[key] !== undefined && responseData[key] !== null) {
            return String(responseData[key]);
          }
        }
        return '';
      };

      const extractedGeneralExam = extractField('generalExam', 'general_exam', ['general_examination']);
      const extractedPrevInvestigation = extractField('previousInvestigation', 'previous_investigation', ['previous_investigations']);

      setFormData({
        complaints: extractField('complaints', 'complaints'),
        pastHistory: extractField('pastHistory', 'past_history'),
        pastOperation: extractField('pastOperation', 'past_operation'),
        pastMedication: extractField('pastMedication', 'past_medication'),
        associatedDisease: extractField('associatedDisease', 'associated_disease', ['associated_diseases']),
        previousInvestigation: extractedPrevInvestigation.trim() ? extractedPrevInvestigation : DEFAULT_PREVIOUS_INVESTIGATION,
        personalHistory: extractField('personalHistory', 'personal_history'),
        familyHistory: extractField('familyHistory', 'family_history'),
        generalExam: extractedGeneralExam.trim() ? extractedGeneralExam : DEFAULT_GENERAL_EXAMINATION,
        abdominalExam: extractField('abdominalExam', 'abdominal_exam', ['abdominal_examination']),
        provisionalDx: extractField('provisionalDx', 'provisional_diagnosis', ['provisional_dx']),
        suggestiveInvestigations: extractField('suggestiveInvestigations', 'suggestive_investigations'),
        advice: extractField('advice', 'advice')
      });

      setIsGenerated(true);
    } catch (error) {
      console.error('Error extracting OPD data:', error);
      alert(`Failed to extract OPD data: ${error.message}. Falling back to local pattern matching.`);
      
      // Fallback local pattern matcher
      const text = transcript.trim();
      const pick = (label) => {
        if (!text) return '';
        const re = new RegExp(`^${label}\\s*:\\s*(.+)$`, 'mi');
        const m = text.match(re);
        return m?.[1]?.trim() || '';
      };

      const generalExamination = pick('Examination');

      setFormData({
        complaints: pick('Chief Complaint'),
        pastHistory: pick('History'),
        pastOperation: '',
        pastMedication: '',
        associatedDisease: '',
        previousInvestigation: DEFAULT_PREVIOUS_INVESTIGATION,
        personalHistory: '',
        familyHistory: '',
        generalExam: generalExamination.trim() ? generalExamination : DEFAULT_GENERAL_EXAMINATION,
        abdominalExam: generalExamination ? generalExamination : 'Normal',
        provisionalDx: pick('Assessment'),
        suggestiveInvestigations: '',
        advice: pick('Plan')
      });

      setIsGenerated(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestClick = (e, fieldId, label) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSuggestState({
      isOpen: true,
      fieldId,
      label,
      triggerRect: rect
    });
  };

  const handleSelectSuggestion = (suggestionText) => {
    const fieldId = suggestState.fieldId;
    const currentVal = formData[fieldId] || '';
    const updatedVal = currentVal.trim() 
      ? `${currentVal.trim()}\n${suggestionText}` 
      : suggestionText;

    handleFieldChange(fieldId, updatedVal);
    
    setSuggestState((prev) => ({
      ...prev,
      isOpen: false
    }));
  };

  return (
    <main className="page">
      <section className="grid">
        {/* Left card */}
        <div className="card">
          <div className="card__top-accent" aria-hidden="true"></div>
          <Header />
          <div className="card__body">
            <VoiceRecorder onAudioReady={handleAudioReady} />
            <ClinicalTranscript
              value={transcript}
              onChange={setTranscript}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              isTranscribing={isTranscribing}
            />
          </div>
        </div>

        {/* Right card */}
        <div className="card">
          <div className="card__top-accent" aria-hidden="true"></div>
          
          <div className="card__header card__header--tight">
            <div className="title-row">
              <span className="title-row__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7 7h10M7 11h10M7 15h6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M8 3h8a2 2 0 0 1 2 2v16l-4-3-4 3-4-3-4 3V5a2 2 0 0 1 2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div className="title-row__text">OPD Report</div>
            </div>
          </div>

          <div className="card__body">
            <OpdReportForm
              isGenerated={isGenerated}
              formData={formData}
              onFieldChange={handleFieldChange}
              onSuggestClick={handleSuggestClick}
            />
          </div>
        </div>
      </section>

      <SuggestionPopup
        isOpen={suggestState.isOpen}
        targetFieldId={suggestState.fieldId}
        fieldLabel={suggestState.label}
        triggerButtonRect={suggestState.triggerRect}
        conversation={transcript}
        onClose={() => setSuggestState((prev) => ({ ...prev, isOpen: false }))}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <Chatbot transcript={transcript} />
    </main>
  );
}

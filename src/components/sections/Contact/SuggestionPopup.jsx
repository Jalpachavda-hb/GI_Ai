import React, { useRef, useEffect, useState } from 'react';
import { API_PATHS } from '@/apipath';


const mapFieldIdToBackend = (fieldId) => {
  const mapping = {
    provisionalDx: 'provisional_diagnosis',
    suggestiveInvestigations: 'suggestive_investigations',
    advice: 'advice',
    complaints: 'complaints',
    pastHistory: 'past_history',
    pastOperation: 'past_operation',
    pastMedication: 'past_medication',
    associatedDisease: 'associated_disease',
    previousInvestigation: 'previous_investigation',
    personalHistory: 'personal_history',
    familyHistory: 'family_history',
    generalExam: 'general_exam',
    abdominalExam: 'abdominal_exam',
  };
  return mapping[fieldId] || fieldId;
};

export default function SuggestionPopup({ isOpen, targetFieldId, fieldLabel, triggerButtonRect, conversation, onClose, onSelectSuggestion }) {
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !triggerButtonRect || !panelRef.current) return;

    const updatePosition = () => {
      const targetTextarea = document.getElementById(`opd_${targetFieldId}`);
      if (!targetTextarea) return;

      const fieldEl = targetTextarea.closest('.opd__field');
      if (!fieldEl) return;

      const fieldRect = fieldEl.getBoundingClientRect();
      const panelH = panelRef.current.offsetHeight;
      const gap = 10;

      let left = fieldRect.left;
      let top = fieldRect.top - panelH - gap;

      left = Math.max(8, Math.min(left, window.innerWidth - fieldRect.width - 8));
      top = Math.max(8, top);

      setPosition({
        left,
        top,
        width: fieldRect.width
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, targetFieldId, triggerButtonRect]);

  useEffect(() => {
    if (!isOpen) {
      setAiSuggestion(null);
      setError(null);
      setLoading(false);
      return;
    }

    if (!conversation || !conversation.trim()) {
      setError("No transcript available to generate suggestion.");
      return;
    }

    const fetchSuggestion = async () => {
      setLoading(true);
      setError(null);
      setAiSuggestion(null);

      const fieldName = mapFieldIdToBackend(targetFieldId);

      try {
        const response = await fetch(API_PATHS.CLINICAL_SUGGESTION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation: conversation.trim(),
            field: fieldName,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status code ${response.status}`);
        }

        const result = await response.json();
        if (result.success && result.data && result.data.value !== undefined) {
          setAiSuggestion(result.data.value);
        } else if (result.value !== undefined) {
          setAiSuggestion(result.value);
        } else if (result.data && typeof result.data === 'string') {
          setAiSuggestion(result.data);
        } else {
          throw new Error('Could not parse suggestion value from response');
        }
      } catch (err) {
        console.error('Clinical Suggestion API Error:', err);
        setError(err.message || 'Failed to fetch clinical suggestion');
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestion();
  }, [isOpen, targetFieldId, conversation]);

  if (!isOpen) return null;

  return (
    <div className="suggest-bubble">
      <div className="suggest-bubble__backdrop" onClick={onClose} />
      <div
        ref={panelRef}
        className="suggest-bubble__panel"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          width: `${position.width}px`
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestTitle"
      >
        <button
          type="button"
          className="suggest-bubble__close"
          onClick={onClose}
          aria-label="Close suggestions"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div id="suggestTitle" className="suggest-bubble__title">{fieldLabel} Suggestions</div>
        
        {loading ? (
          <div className="suggest-bubble__loading">
            <div className="spinner spinner--small"></div>
            <span>Fetching suggestion...</span>
          </div>
        ) : error ? (
          <div className="suggest-bubble__error">
            <span>{error}</span>
          </div>
        ) : aiSuggestion ? (
          <div className="suggest-bubble__list">
            <button
              type="button"
              className="suggest-bubble__item"
              onClick={() => onSelectSuggestion(aiSuggestion)}
            >
              {aiSuggestion}
            </button>
          </div>
        ) : (
          <div className="suggest-bubble__error">
            <span>No suggestion generated.</span>
          </div>
        )}
      </div>
    </div>
  );
}

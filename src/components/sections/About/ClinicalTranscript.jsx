import React from 'react';
import SectionTitle from '@/components/common/SectionTitle/SectionTitle';

export default function ClinicalTranscript({ value, onGenerate, isGenerating, isTranscribing }) {
  const fileIcon = (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8 3h8a2 2 0 0 1 2 2v16l-4-3-4 3-4-3-4 3V5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div>
      <SectionTitle icon={fileIcon} text="Clinical Transcript" />
      
      <div className="textarea-wrap">
        <textarea
          id="transcript"
          className="textarea"
          placeholder="Medical dictation will appear here..."
          value={value}
          readOnly
          disabled={isTranscribing}
        />
        {isTranscribing && (
          <div className="textarea-loader">
            <span className="spinner" aria-hidden="true"></span>
            <span>Transcribing audio...</span>
          </div>
        )}
      </div>

      <div className="actions">
        <button
          id="btnGenerate"
          className={`btn btn--dark btn--pill ${isGenerating ? 'is-active' : ''}`}
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          style={{
            opacity: isGenerating ? 0.8 : 1,
            filter: isGenerating ? 'grayscale(0.1)' : 'none',
          }}
        >
          <span className="btn__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M14 3h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 14 21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {isGenerating ? 'Generating...' : 'Generate Form'}
        </button>
      </div>
    </div>
  );
}

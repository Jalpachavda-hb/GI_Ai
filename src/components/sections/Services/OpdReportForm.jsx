import React, { useState } from 'react';
import Input from '@/components/common/Input/Input';
import { API_PATHS } from '@/apipath';

export default function OpdReportForm({ isGenerated, formData, onFieldChange, onSuggestClick, onSave }) {
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved'
  const [pdfFilename, setPdfFilename] = useState('');

  const handleSaveClick = async () => {
    setSaveStatus('saving');
    
    // Map camelCase fields to snake_case payload for API compatibility
    const payload = {
      complaints: formData.complaints || '',
      pastHistory: formData.pastHistory || '',
      past_history: formData.pastHistory || '',
      pastOperation: formData.pastOperation || '',
      past_operation: formData.pastOperation || '',
      pastMedication: formData.pastMedication || '',
      past_medication: formData.pastMedication || '',
      associatedDisease: formData.associatedDisease || '',
      associated_disease: formData.associatedDisease || '',
      associated_diseases: formData.associatedDisease || '',
      previousInvestigation: formData.previousInvestigation || '',
      previous_investigation: formData.previousInvestigation || '',
      previous_investigations: formData.previousInvestigation || '',
      personalHistory: formData.personalHistory || '',
      personal_history: formData.personalHistory || '',
      familyHistory: formData.familyHistory || '',
      family_history: formData.familyHistory || '',
      generalExam: formData.generalExam || '',
      general_exam: formData.generalExam || '',
      general_examination: formData.generalExam || '',
      abdominalExam: formData.abdominalExam || '',
      abdominal_exam: formData.abdominalExam || '',
      abdominal_examination: formData.abdominalExam || '',
      provisionalDx: formData.provisionalDx || '',
      provisional_diagnosis: formData.provisionalDx || '',
      provisional_dx: formData.provisionalDx || '',
      suggestiveInvestigations: formData.suggestiveInvestigations || '',
      suggestive_investigations: formData.suggestiveInvestigations || '',
      advice: formData.advice || ''
    };

    try {
      const response = await fetch(API_PATHS.SAVE_FORM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.pdf_filename) {
        setPdfFilename(result.pdf_filename);
        setSaveStatus('saved');
        if (onSave) {
          onSave(result);
        }
        // Auto-remove success pill and download PDF button, reverting to Save button after 10 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 10000);
      } else {
        throw new Error(result.error_message || 'API response success flag was false or missing pdf_filename');
      }
    } catch (err) {
      console.error('Error saving OPD Form:', err);
      alert(`Failed to save OPD Report: ${err.message}`);
      setSaveStatus('idle');
    }
  };

  const handleDownloadPdf = async () => {
    if (!pdfFilename) return;
    const pdfUrl = `${API_PATHS.DOWNLOAD_PDF}/${pdfFilename}`;
    
    try {
      const response = await fetch(pdfUrl, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download file (status ${response.status})`);
      }
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object after trigger
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      // Fallback: attempt to open it in a new window/tab if fetch fails
      window.open(pdfUrl, '_blank');
    }
  };

  if (!isGenerated) {
    return (
      <div className="report-box">
        <div className="report-box__placeholder">
          <div className="report-box__placeholder-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 15a3 3 0 0 0 3-3V7a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 11v1a7 7 0 0 1-14 0v-1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="report-box__placeholder-title">No clinical data.</div>
          <div className="report-box__placeholder-sub">
            Generate form using transcript.
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Complaints', id: 'complaints', placeholder: 'Enter Complaints details...' },
    { label: 'Past History', id: 'pastHistory', placeholder: 'Enter Past History details...' },
    { label: 'Past Operation', id: 'pastOperation', placeholder: 'Enter Past Operation details...' },
    { label: 'Past Medication', id: 'pastMedication', placeholder: 'Enter Past Medication details...' },
    { label: 'Associated Disease', id: 'associatedDisease', placeholder: 'Enter Associated Disease details...' },
    { label: 'Previous Investigation', id: 'previousInvestigation', placeholder: 'Enter Previous Investigation details...' },
    { label: 'Personal History', id: 'personalHistory', placeholder: 'Enter Personal History details...' },
    { label: 'Family History', id: 'familyHistory', placeholder: 'Enter Family History details...' },
    { label: 'General Examination', id: 'generalExam', placeholder: 'Enter General Examination details...' },
    { label: 'Abdominal Examination', id: 'abdominalExam', placeholder: 'Enter Abdominal Examination details...' },
    { label: 'Provisional Diagnosis', id: 'provisionalDx', placeholder: 'Enter Provisional Diagnosis details...', showSuggest: true },
    { label: 'Suggestive Investigations', id: 'suggestiveInvestigations', placeholder: 'Enter Suggestive Investigations details...', showSuggest: true },
    { label: 'Advice', id: 'advice', placeholder: 'Enter Advice details...', showSuggest: true }
  ];

  return (
    <div className="opd">
      <div className="opd__grid">
        {fields.map((field) => (
          <Input
            key={field.id}
            label={field.label}
            id={`opd_${field.id}`}
            placeholder={field.placeholder}
            value={formData[field.id] || ''}
            onChange={(e) => onFieldChange(field.id, e.target.value)}
            showSuggest={field.showSuggest}
            onSuggestClick={(e) => onSuggestClick(e, field.id, field.label)}
          />
        ))}
      </div>
      <div className="opd__actions-container">
        {saveStatus === 'saved' && (
          <>
            <span className="save-status-pill">
              <span className="save-status-pill__dot"></span>
              Report Saved Successfully!
            </span>
            <button
              className="btn btn--save btn--download-pdf"
              type="button"
              onClick={handleDownloadPdf}
            >
              <span className="btn__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" />
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" />
                  <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" />
                </svg>
              </span>
              Download PDF
            </button>
          </>
        )}

        {saveStatus !== 'saved' && (
          <button
            className={`btn btn--save ${
              saveStatus === 'saving' ? 'btn--saving btn--primary' : 'btn--primary'
            }`}
            type="button"
            disabled={saveStatus === 'saving'}
            onClick={handleSaveClick}
          >
            {saveStatus === 'saving' ? (
              <>
                <span className="btn__icon" aria-hidden="true">
                  <span className="spinner--btn"></span>
                </span>
                Saving...
              </>
            ) : (
              <>
                <span className="btn__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M17 21v-8H7v8M7 3v5h8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                Save
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

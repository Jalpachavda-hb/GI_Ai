import React from 'react';

export default function Input({ label, id, value, onChange, placeholder, showSuggest = false, onSuggestClick, ...props }) {
  return (
    <div className="opd__field">
      {showSuggest ? (
        <div className="opd__label-row">
          <div className="opd__label">
            <span className="opd__dot" aria-hidden="true"></span>
            {label}
          </div>
          <button
            type="button"
            className="opd__suggest-btn"
            onClick={onSuggestClick}
            aria-label={`Show suggestions for ${label}`}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26A7 7 0 0 0 12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="opd__label">
          <span className="opd__dot" aria-hidden="true"></span>
          {label}
        </div>
      )}
      <textarea
        id={id}
        className="opd__input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
}

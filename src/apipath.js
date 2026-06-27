// Toggle between local and live API environments here
const IS_LIVE = true; // Set to true to switch to the live API environment

// const BASE_URL_LOCAL = 'http://192.168.29.201:8001/api/v1';
const BASE_URL_LOCAL = 'http://192.168.29.201:8001/api/v1';
const BASE_URL_LIVE = 'http://10.156.121.233:8081/api/v1';

export const BASE_URL = IS_LIVE ? BASE_URL_LIVE : BASE_URL_LOCAL;

export const API_PATHS = {
  // POST: Transcribe audio file
  TRANSCRIBE: `${BASE_URL}/audio/transcribe`,

  // POST: Extract OPD data from text
  EXTRACT_OPD: `${BASE_URL}/audio/extract-opd`,

  // POST: Get clinical suggestions for a field based on transcript
  CLINICAL_SUGGESTION: `${BASE_URL}/audio/clinical-suggestion`,

  // POST: Chatbot doctor question answering based on transcript
  DOCTOR_QUESTION: `${BASE_URL}/audio/doctor-question`,

  // POST: Save form details and generate PDF
  SAVE_FORM: `${BASE_URL}/audio/save_form`,

  // GET: Download generated PDF report
  DOWNLOAD_PDF: `${BASE_URL}/audio/download_pdf`,
};
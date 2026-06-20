// LocalStorage-based patient memory management
// Stores patient data in browser memory only - nothing sent to server

const STORAGE_KEY = 'patientMemoryDemo';
const TIMELINE_KEY = 'patientMemoryTimelineDemo';

/**
 * Save patient memory to localStorage
 * @param {string} patientId - Unique identifier for the patient
 * @param {Object} memory - PatientWiki object
 */
export const savePatientMemory = (patientId, memory) => {
  try {
    const memories = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    memories[patientId] = memory;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    return true;
  } catch (error) {
    console.error('Failed to save patient memory:', error);
    return false;
  }
};

/**
 * Load patient memory from localStorage
 * @param {string} patientId - Unique identifier for the patient
 * @returns {Object|null} - PatientWiki object or null if not found
 */
export const loadPatientMemory = (patientId) => {
  try {
    const memories = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return memories[patientId] || null;
  } catch (error) {
    console.error('Failed to load patient memory:', error);
    return null;
  }
};

/**
 * Clear all patient memory from localStorage
 */
export const clearAllPatientMemory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear patient memory:', error);
    return false;
  }
};

/**
 * Remove memory for specific patient
 * @param {string} patientId - Unique identifier for the patient
 */
export const removePatientMemory = (patientId) => {
  try {
    const memories = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete memories[patientId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    return true;
  } catch (error) {
    console.error('Failed to remove patient memory:', error);
    return false;
  }
};

/**
 * Save a visit entry to the timeline for a patient
 * @param {string} patientId
 * @param {Object} visit
 */
export const savePatientVisit = (patientId, visit) => {
  try {
    const timeline = JSON.parse(localStorage.getItem(TIMELINE_KEY) || '{}');
    const visits = timeline[patientId] || [];
    timeline[patientId] = [...visits, visit];
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));
    return true;
  } catch (error) {
    console.error('Failed to save patient visit:', error);
    return false;
  }
};

/**
 * Load visit timeline for a patient
 * @param {string} patientId
 * @returns {Array}
 */
export const loadPatientVisits = (patientId) => {
  try {
    const timeline = JSON.parse(localStorage.getItem(TIMELINE_KEY) || '{}');
    return timeline[patientId] || [];
  } catch (error) {
    console.error('Failed to load patient visits:', error);
    return [];
  }
};

/**
 * Clear all stored visit timelines
 */
export const clearAllPatientVisits = () => {
  try {
    localStorage.removeItem(TIMELINE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear patient visit timeline:', error);
    return false;
  }
};

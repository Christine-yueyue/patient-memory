// Browser-based de-identification - runs before sending transcript to LLM
// Goal: data minimization - clinical story goes to LLM, identity does not

const DATE_PATTERNS = [
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b/g,
  /\b\d{4}-\d{2}-\d{2}\b/g,
  /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,
  /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b/g
];

const PHONE_PATTERN = /\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const HEALTHCARD_PATTERN = /\b\d{10}[A-Za-z]{0,2}\b/g;
const POSTALCODE_PATTERN = /\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b/g;

export function deidentify(transcript, patientNames = []) {
  if (!transcript) return { clean: "", map: {} };
  
  let clean = transcript;
  const map = {};
  
  const sortedNames = [...patientNames].sort((a, b) => b.length - a.length);
  sortedNames.forEach((name, index) => {
    if (!name || !name.trim()) return;
    
    const token = index === 0 ? "[PATIENT]" : `[PERSON_${index}]`;
    map[token] = name;
    
    const nameRegex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    clean = clean.replace(nameRegex, token);
    
    name.split(" ").forEach(part => {
      if (part.length > 2) {
        const partRegex = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
        clean = clean.replace(partRegex, token);
      }
    });
  });

  let dateCounter = 0;
  const replaceDate = (match) => {
    const val = match;
    let token = "[DATE]";
    if (dateCounter > 0) token = `[DATE_${dateCounter}]`;
    const existingToken = Object.keys(map).find(k => map[k] === val);
    if (existingToken) {
      token = existingToken;
    } else {
      map[token] = val;
      dateCounter++;
    }
    return token;
  };

  DATE_PATTERNS.forEach(pattern => {
    clean = clean.replace(pattern, replaceDate);
  });

  let phoneCounter = 0;
  const replacePhone = (match) => {
    const val = match;
    let token = "[PHONE]";
    if (phoneCounter > 0) token = `[PHONE_${phoneCounter}]`;
    const existingToken = Object.keys(map).find(k => map[k] === val);
    if (existingToken) {
      token = existingToken;
    } else {
      map[token] = val;
      phoneCounter++;
    }
    return token;
  };

  clean = clean.replace(PHONE_PATTERN, replacePhone);

  let emailCounter = 0;
  const replaceEmail = (match) => {
    const val = match;
    let token = "[EMAIL]";
    if (emailCounter > 0) token = `[EMAIL_${emailCounter}]`;
    const existingToken = Object.keys(map).find(k => map[k] === val);
    if (existingToken) {
      token = existingToken;
    } else {
      map[token] = val;
      emailCounter++;
    }
    return token;
  };

  clean = clean.replace(EMAIL_PATTERN, replaceEmail);

  const replaceHC = (match) => {
    const val = match;
    const token = "[HEALTHCARD]";
    if (!map[token]) map[token] = val;
    return token;
  };

  clean = clean.replace(HEALTHCARD_PATTERN, replaceHC);

  const replacePostal = (match) => {
    const val = match;
    const token = "[POSTALCODE]";
    if (!map[token]) map[token] = val;
    return token;
  };

  clean = clean.replace(POSTALCODE_PATTERN, replacePostal);

  return { clean, map };
}

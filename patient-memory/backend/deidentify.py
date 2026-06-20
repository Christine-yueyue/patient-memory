import re


DATE_PATTERNS = [
    # January 15, 2026 or Jan 15 2026
    r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{1,2},?\s+\d{4}\b',
    # 2026-01-15
    r'\b\d{4}-\d{2}-\d{2}\b',
    # 01/15/2026 or 01-15-26
    r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b',
    # January 2026
    r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\b',
]

PHONE_PATTERN = r'\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
EMAIL_PATTERN = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
HEALTHCARD_PATTERN = r'\b\d{10}[A-Za-z]{0,2}\b'
POSTALCODE_PATTERN = r'\b[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d\b'


def deidentify(text: str, patient_names: list[str] = []) -> dict:
    """
    Strip PII from text before sending to LLM.
    Returns {"clean": str, "map": dict} where map allows re-identification on the frontend.
    Names are a demo shortcut via regex — production would use proper NER/LLM-based de-id.
    """
    clean = text
    replacement_map = {}

    # --- Patient names (longest first to avoid partial replacements) ---
    sorted_names = sorted(patient_names, key=len, reverse=True)
    for i, name in enumerate(sorted_names):
        if not name.strip():
            continue
        token = "[PATIENT]" if i == 0 else f"[PERSON_{i}]"
        replacement_map[token] = name
        clean = re.sub(re.escape(name), token, clean, flags=re.IGNORECASE)
        # Also replace individual name parts (first/last separately)
        for part in name.split():
            if len(part) > 2:
                clean = re.sub(r'\b' + re.escape(part) + r'\b', token, clean, flags=re.IGNORECASE)

    # --- Dates ---
    date_counter = [0]
    def replace_date(match):
        val = match.group(0)
        token = "[DATE]" if date_counter[0] == 0 else f"[DATE_{date_counter[0]}]"
        if val not in replacement_map.values():
            replacement_map[token] = val
            date_counter[0] += 1
        else:
            token = next(k for k, v in replacement_map.items() if v == val)
        return token

    for pattern in DATE_PATTERNS:
        clean = re.sub(pattern, replace_date, clean, flags=re.IGNORECASE)

    # --- Phone numbers ---
    phone_counter = [0]
    def replace_phone(match):
        val = match.group(0)
        token = "[PHONE]" if phone_counter[0] == 0 else f"[PHONE_{phone_counter[0]}]"
        if val not in replacement_map.values():
            replacement_map[token] = val
            phone_counter[0] += 1
        else:
            token = next(k for k, v in replacement_map.items() if v == val)
        return token

    clean = re.sub(PHONE_PATTERN, replace_phone, clean)

    # --- Emails ---
    email_counter = [0]
    def replace_email(match):
        val = match.group(0)
        token = "[EMAIL]" if email_counter[0] == 0 else f"[EMAIL_{email_counter[0]}]"
        if val not in replacement_map.values():
            replacement_map[token] = val
            email_counter[0] += 1
        else:
            token = next(k for k, v in replacement_map.items() if v == val)
        return token

    clean = re.sub(EMAIL_PATTERN, replace_email, clean, flags=re.IGNORECASE)

    # --- Ontario health card numbers ---
    def replace_hc(match):
        val = match.group(0)
        token = "[HEALTHCARD]"
        replacement_map[token] = val
        return token

    clean = re.sub(HEALTHCARD_PATTERN, replace_hc, clean)

    # --- Canadian postal codes ---
    def replace_postal(match):
        val = match.group(0)
        token = "[POSTALCODE]"
        replacement_map[token] = val
        return token

    clean = re.sub(POSTALCODE_PATTERN, replace_postal, clean, flags=re.IGNORECASE)

    return {"clean": clean, "map": replacement_map}


def reidentify(text: str, replacement_map: dict) -> str:
    """Restore real values from tokens — runs on frontend, here for testing."""
    result = text
    for token, real_value in replacement_map.items():
        result = result.replace(token, real_value)
    return result

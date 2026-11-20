import re
from typing import List, Dict, Any

# Standard English stopwords with intentional preservation of negations and evidentiary modifiers
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
    "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
    "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
    "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
    "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
    "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
    "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
    "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
    "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll",
    "she's", "should", "shouldn't", "so", "some", "such", "than", "that", "that's",
    "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
    "these", "they", "they'd", "they'll", "they're", "they've", "this", "those",
    "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
    "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when",
    "when's", "where", "where's", "which", "while", "who", "who's", "whom", "why",
    "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll",
    "you're", "you've", "your", "yours", "yourself", "yourselves"
}

# High-salience sensational and conspiracy vocabulary cues
SENSATIONAL_CUES = [
    "shocking", "bombshell", "secret they don't want you to know", "miracle cure",
    "100% guaranteed", "mainstream media won't tell you", "exposed", "conspiracy",
    "deep state", "unbelievable truth", "leaked memo", "banned by government",
    "illuminati", "cover up", "miracle remedy", "hidden truth"
]

CREDIBLE_INDICATORS = [
    "peer-reviewed", "clinical trial", "spokesperson stated", "according to official",
    "reuters", "associated press", "published in the journal", "official statistics",
    "replicated findings", "spokesperson confirmed", "data demonstrates"
]

def clean_text(text: str) -> str:
    """
    Clean and normalize raw text for NLP feature extraction.
    1. Removes URLs (http/https/ftp)
    2. Strips email addresses and mentions
    3. Normalizes whitespace and removes control characters
    4. Converts to lowercase while preserving alphanumerics
    """
    if not text or not isinstance(text, str):
        return ""

    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
    # Remove HTML tags if present
    text = re.sub(r'<.*?>', ' ', text)
    # Remove email addresses
    text = re.sub(r'\S+@\S+', ' ', text)
    # Remove emojis and non-ascii characters for clean tokenization
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    # Keep letters, numbers, and basic punctuation needed for syntax cues
    text = re.sub(r'[^a-zA-Z0-9\s.,!?\'"-]', ' ', text)
    # Collapse multiple whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def tokenize_text(text: str, remove_stopwords: bool = True) -> List[str]:
    """
    Tokenize normalized text into clean word tokens.
    """
    cleaned = clean_text(text).lower()
    # Extract alphanumeric word tokens
    words = re.findall(r'\b[a-z0-9\'-]+\b', cleaned)
    if remove_stopwords:
        words = [w for w in words if w not in STOPWORDS and len(w) > 1]
    return words

def extract_linguistic_features(raw_text: str) -> Dict[str, Any]:
    """
    Extract linguistic surface features useful for Explainable AI (XAI) breakdown.
    """
    if not raw_text:
        return {
            "char_count": 0,
            "word_count": 0,
            "uppercase_ratio": 0.0,
            "exclamation_count": 0,
            "question_count": 0,
            "sensational_cue_matches": [],
            "credible_cue_matches": []
        }

    total_chars = len(raw_text)
    uppercase_chars = sum(1 for c in raw_text if c.isupper())
    uppercase_ratio = round((uppercase_chars / total_chars) * 100, 1) if total_chars > 0 else 0.0

    exclamations = raw_text.count("!")
    questions = raw_text.count("?")

    lower_text = raw_text.lower()
    sensational_found = [cue for cue in SENSATIONAL_CUES if cue in lower_text]
    credible_found = [cue for cue in CREDIBLE_INDICATORS if cue in lower_text]

    tokens = tokenize_text(raw_text, remove_stopwords=False)

    return {
        "char_count": total_chars,
        "word_count": len(tokens),
        "uppercase_ratio": uppercase_ratio,
        "exclamation_count": exclamations,
        "question_count": questions,
        "sensational_cue_matches": sensational_found,
        "credible_cue_matches": credible_found
    }

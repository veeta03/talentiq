import PyPDF2
import spacy

nlp = spacy.load("en_core_web_sm")

COMMON_SKILLS = [
    "python", "java", "sql", "django", "fastapi",
    "machine learning", "deep learning", "react",
    "mysql", "aws", "docker"
]

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()

def extract_skills(text):
    found_skills = []
    for skill in COMMON_SKILLS:
        if skill in text:
            found_skills.append(skill)
    return list(set(found_skills))

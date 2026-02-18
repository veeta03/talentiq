from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import json
import numpy as np
import json
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def calculate_match_score(resume, job):

    try:
        # -------- Semantic Score --------
        resume_embedding = np.array(
            json.loads(resume.embedding)
        ).reshape(1, -1)

        job_embedding = np.array(
            json.loads(job.embedding)
        ).reshape(1, -1)

        semantic_score = cosine_similarity(
            resume_embedding,
            job_embedding
        )[0][0]

    except Exception:
        semantic_score = 0


    # -------- Skill Overlap Score --------
    job_skills = [
        s.strip().lower()
        for s in job.required_skills.split(",")
        if s.strip()
    ]

    resume_text = resume.extracted_text.lower()

    matched_skills = [
        skill for skill in job_skills
        if skill in resume_text
    ]

    skill_score = (
        len(matched_skills) / len(job_skills)
        if job_skills else 0
    )

    # -------- Hybrid Score --------
    final_score = (0.6 * semantic_score) + (0.4 * skill_score)

    return round(final_score * 100, 2)


def skill_gap_analysis(resume_text, required_skills_str):
    required_skills = [skill.strip() for skill in required_skills_str.split(",")]
    resume_text = resume_text.lower()

    matched = []
    missing = []

    for skill in required_skills:
        if skill in resume_text:
            matched.append(skill)
        else:
            missing.append(skill)

    match_ratio = len(matched) / len(required_skills) if required_skills else 0

    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "skill_match_ratio": round(match_ratio * 100, 2)
    }
def generate_embedding(text):
    vector = model.encode(text)
    return json.dumps(vector.tolist())
def batch_rank(resume_embeddings_list, job_embedding_str):
    # Convert job embedding
    job_vector = np.array(json.loads(job_embedding_str)).reshape(1, -1)

    # Convert all resume embeddings into matrix
    resume_vectors = np.array([
        json.loads(emb) for emb in resume_embeddings_list
    ])

    # Compute cosine similarity in one shot
    similarities = cosine_similarity(resume_vectors, job_vector)

    # Flatten results
    scores = similarities.flatten() * 100

    return scores.tolist()
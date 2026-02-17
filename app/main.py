from dotenv import load_dotenv
import os

load_dotenv()
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from datetime import datetime
from collections import defaultdict
from sqlalchemy import func

from app.database import engine, SessionLocal
from app import models, schemas, crud
from app.auth import authenticate_user, create_access_token, get_current_user, require_role
from app.services.match_engine import (
    calculate_match_score,
    generate_embedding,
    skill_gap_analysis
)
from app.services.resume_parser import extract_text_from_pdf, extract_skills
from app.models import User, Application, Job


app = FastAPI()
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- AUTH ----------------
@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return crud.create_user(db=db, user=user)

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

# ---------------- RESUME ----------------
import os
from uuid import uuid4

UPLOAD_FOLDER = "uploaded_resumes"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.post("/upload-resume")
def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    # 🔥 Generate unique filename
    unique_filename = f"{uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    # 🔥 Save file to disk
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    # 🔥 Extract text
    text = extract_text_from_pdf(open(file_path, "rb"))
    skills = extract_skills(text)
    embedding = generate_embedding(text)

    existing_resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).first()

    if existing_resume:
        existing_resume.extracted_text = text
        existing_resume.extracted_skills = ", ".join(skills)
        existing_resume.embedding = embedding
        existing_resume.file_path = file_path
    else:
        new_resume = models.Resume(
            user_id=current_user.id,
            extracted_text=text,
            extracted_skills=", ".join(skills),
            embedding=embedding,
            file_path=file_path
        )
        db.add(new_resume)

    db.commit()

    return {"message": "Resume uploaded successfully 🚀"}

# ---------------- JOBS ----------------
@app.post("/create-job")
def create_job(
    title: str,
    description: str,
    required_skills: str,
    current_user: models.User = Depends(require_role(["recruiter","admin"])),
    db: Session = Depends(get_db)
):
    embedding = generate_embedding(description)

    job = models.Job(
        title=title,
        description=description,
        required_skills=required_skills.lower(),
        embedding=embedding,
        recruiter_id=current_user.id
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return {"message": "Job created successfully 🚀", "job_id": job.id}

@app.get("/my-jobs")
def get_my_jobs(
    current_user: models.User = Depends(require_role(["recruiter","admin"])),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        jobs = db.query(models.Job).all()
    else:
        jobs = db.query(models.Job).filter(
            models.Job.recruiter_id == current_user.id
        ).all()

    return [{"id": job.id, "title": job.title, "required_skills": job.required_skills} for job in jobs]

@app.get("/jobs")
def get_all_jobs(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    jobs = db.query(models.Job).all()

    return [{"id": job.id, "title": job.title, "required_skills": job.required_skills} for job in jobs]

# ---------------- APPLY ----------------
@app.post("/apply/{job_id}")
def apply_to_job(
    job_id: int,
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):

    # 🔥 Check job exists
    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 🔥 Check resume uploaded
    resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=400,
            detail="Please upload your resume before applying"
        )

    # 🔥 Check already applied
    existing = db.query(models.MatchResult).filter(
        models.MatchResult.user_id == current_user.id,
        models.MatchResult.job_id == job_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    # 🔥 Create application
    match = models.MatchResult(
        user_id=current_user.id,
        job_id=job_id,
        score=0,
        status="applied"
    )

    db.add(match)
    db.commit()

    return {"message": "Application submitted successfully 🚀"}

# ---------------- RANK (FIXED) ----------------
@app.post("/rank/{job_id}")
def rank_candidates(
    job_id: int,
    current_user: models.User = Depends(require_role(["admin","recruiter"])),
    db: Session = Depends(get_db)
):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    applications = db.query(models.MatchResult).filter(
        models.MatchResult.job_id == job_id
    ).all()

    ranking = []

    for app in applications:
        resume = db.query(models.Resume).filter(
            models.Resume.user_id == app.user_id
        ).first()

        if not resume:
            continue

        score = calculate_match_score(resume, job)
        app.score = score

        user = db.query(models.User).filter(
            models.User.id == app.user_id
        ).first()

        ranking.append({
            "user_id": app.user_id,
            "candidate": user.name,
            "score": score
        })

    db.commit()

    ranking = sorted(ranking, key=lambda x: x["score"], reverse=True)

    return {"job_title": job.title, "ranked_candidates": ranking}

# ---------------- APPLICATIONS ----------------
@app.get("/job-applications/{job_id}")
def get_job_applications(
    job_id: int,
    current_user: models.User = Depends(require_role(["admin","recruiter"])),
    db: Session = Depends(get_db)
):
    results = db.query(models.MatchResult).filter(
        models.MatchResult.job_id == job_id
    ).all()

    response = []

    for result in results:
        user = db.query(models.User).filter(
            models.User.id == result.user_id
        ).first()

        resume = db.query(models.Resume).filter(
            models.Resume.user_id == result.user_id
        ).first()

        response.append({
            "user_id": user.id,
            "user_name": user.name,
            "resume_id": resume.id if resume else None,
            "status": result.status,
            "score": result.score
        })

    return response

# ---------------- UPDATE STATUS ----------------
@app.post("/update-status/{job_id}/{user_id}")
def update_status(
    job_id: int,
    user_id: int,
    status: dict,
    current_user: models.User = Depends(require_role(["admin","recruiter"])),
    db: Session = Depends(get_db)
):
    match = db.query(models.MatchResult).filter(
        models.MatchResult.job_id == job_id,
        models.MatchResult.user_id == user_id
    ).first()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    match.status = status["status"]
    db.commit()

    return {"message": "Status updated"}

# ---------------- SKILL GAP ----------------
@app.post("/skill-gap/{job_id}")
def analyze_skill_gap(
    job_id: int,
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):

    resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=400,
            detail="Upload resume before checking skill gap"
        )

    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    result = skill_gap_analysis(
        resume.extracted_text,
        job.required_skills
    )

    return {
        "job_title": job.title,
        "matched_skills": result["matched_skills"],
        "missing_skills": result["missing_skills"],
        "skill_match_ratio": result["skill_match_ratio"]
    }
# ---------------- MATCH SCORE ----------------
@app.post("/match/{job_id}")
def match_resume(
    job_id: int,
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):

    resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=400,
            detail="Upload resume before checking match score"
        )

    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    score = calculate_match_score(resume, job)

    return {
        "match_percentage": score
    }

import os
from fastapi import HTTPException
from fastapi.responses import FileResponse

@app.get("/download-resume/{resume_id}")
def download_resume(
    resume_id: int,
    current_user: models.User = Depends(require_role(["admin", "recruiter"])),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id
    ).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if not resume.file_path:
        raise HTTPException(status_code=404, detail="File path missing")

    if not os.path.exists(resume.file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(
        resume.file_path,
        media_type="application/pdf",
        filename="resume.pdf"
    )
# ---------------- GLOBAL DASHBOARD ANALYTICS ----------------
@app.get("/dashboard-analytics")
def dashboard_analytics(
    current_user: models.User = Depends(require_role(["admin", "recruiter"])),
    db: Session = Depends(get_db)
):

    # 🔥 Get only recruiter’s jobs (admin sees all)
    if current_user.role == "admin":
        jobs = db.query(models.Job).all()
    else:
        jobs = db.query(models.Job).filter(
            models.Job.recruiter_id == current_user.id
        ).all()

    job_ids = [job.id for job in jobs]

    total_jobs = len(jobs)

    # 🔥 Applications only for recruiter jobs
    applications = db.query(models.MatchResult).filter(
        models.MatchResult.job_id.in_(job_ids)
    ).all()

    total_applications = len(applications)

    shortlisted = sum(1 for a in applications if a.status == "shortlisted")
    rejected = sum(1 for a in applications if a.status == "rejected")
    applied = sum(1 for a in applications if a.status == "applied")

    scores = [a.score for a in applications if a.score is not None]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0

    return {
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "applied": applied,
        "average_match_score": average_score
    }
# ---------------- JOB ANALYTICS ----------------
@app.get("/job-analytics/{job_id}")
def job_analytics(
    job_id: int,
    current_user: models.User = Depends(require_role(["admin", "recruiter"])),
    db: Session = Depends(get_db)
):

    job = db.query(models.Job).filter(
        models.Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 🔒 Recruiter cannot view other recruiter job analytics
    if current_user.role != "admin" and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    applications = db.query(models.MatchResult).filter(
        models.MatchResult.job_id == job_id
    ).all()

    total_applications = len(applications)
    shortlisted = sum(1 for a in applications if a.status == "shortlisted")
    rejected = sum(1 for a in applications if a.status == "rejected")
    applied = sum(1 for a in applications if a.status == "applied")

    scores = [a.score for a in applications if a.score is not None]
    average_score = round(sum(scores) / len(scores), 2) if scores else 0

    return {
        "job_title": job.title,
        "total_applications": total_applications,
        "shortlisted": shortlisted,
        "rejected": rejected,
        "applied": applied,
        "average_score": average_score
    }
# ---------------- MY APPLICATIONS ----------------
@app.get("/my-applications")
def get_my_applications(
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    applications = db.query(models.MatchResult).filter(
        models.MatchResult.user_id == current_user.id
    ).all()

    result = []

    for app in applications:
        job = db.query(models.Job).filter(
            models.Job.id == app.job_id
        ).first()

        result.append({
            "job_id": app.job_id,
            "job_title": job.title if job else "Unknown",
            "status": app.status,
            "score": app.score
        })

    return result
@app.get("/my-resume")
def get_my_resume(
    current_user: models.User = Depends(require_role(["candidate"])),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(
        models.Resume.user_id == current_user.id
    ).first()

    if not resume:
        return {"message": "No resume uploaded"}

    return {
        "resume_id": resume.id,
        "uploaded_at": resume.created_at
    }

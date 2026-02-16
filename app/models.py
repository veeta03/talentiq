from sqlalchemy import Column, Integer, String
from app.database import Base
from datetime import datetime
from sqlalchemy import Float, DateTime
from sqlalchemy import Text
from sqlalchemy.sql import func
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    password = Column(String(200))
    role = Column(String(50))
from sqlalchemy import Text, ForeignKey
from sqlalchemy.orm import relationship

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    extracted_text = Column(Text)
    extracted_skills = Column(Text)
    embedding = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    file_path = Column(String(255))


    user = relationship("User")
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200))
    description = Column(Text)
    required_skills = Column(Text)  # comma separated skills
    embedding = Column(Text)
    recruiter_id = Column(Integer, ForeignKey("users.id"))  # 🔥 ADD THIS

class MatchResult(Base):
    __tablename__ = "match_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="applied")

    user = relationship("User")
    job = relationship("Job")
class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String(100), default="Applied")

    applied_at = Column(DateTime, default=datetime.utcnow)
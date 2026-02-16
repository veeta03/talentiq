🚀 TalentIQ – AI Powered Applicant Tracking System (ATS)

An AI-driven Applicant Tracking System that automates resume screening, candidate ranking, and hiring analytics using semantic similarity and skill-based matching.

🧠 Overview

TalentIQ is a full-stack AI-powered Applicant Tracking System (ATS) built using FastAPI, React, MySQL, and NLP techniques.

It enables recruiters to:

Create job postings

Automatically rank candidates using AI

Shortlist or reject applicants

Analyze hiring performance via dashboards

Candidates can:

Upload resumes

Apply to jobs

View AI match score

Analyze skill gaps

🏗 Architecture
Frontend (React + TailwindCSS)
        ↓
FastAPI Backend
        ↓
MySQL Database
        ↓
AI Layer (Embeddings + Cosine Similarity)

⚙️ Tech Stack
🖥 Frontend

React.js

TailwindCSS

Axios

Chart.js

⚙ Backend

FastAPI

SQLAlchemy

JWT Authentication

Uvicorn

🗄 Database

MySQL

🤖 AI / NLP

Resume text extraction

Embedding generation

Cosine similarity scoring

Hybrid scoring (Semantic + Skill overlap)

👨‍💼 Recruiter Features

✅ Create Job Postings

✅ View Applications Per Job

✅ AI-Based Candidate Ranking

✅ Shortlist / Reject Candidates

✅ Download Resume

✅ Status Filtering (Applied / Shortlisted / Rejected)

✅ Hiring Analytics Dashboard

✅ Match Score Distribution Charts

👤 Candidate Features

✅ Upload Resume

✅ Browse Jobs

✅ Apply to Jobs

✅ AI Match Score

✅ Skill Gap Analysis

✅ View Application Status

🤖 AI Scoring Logic

The system uses a hybrid scoring model:

Final Score = (0.6 × Semantic Similarity) 
            + (0.4 × Skill Overlap Score)

🔹 Semantic Similarity

Resume embeddings compared with job embeddings

Cosine similarity used for ranking

🔹 Skill Overlap

Compares required skills with extracted resume text

Calculates skill coverage ratio

📊 Dashboard Analytics

Recruiter Dashboard includes:

Total Candidates

Shortlisted Count

Rejected Count

Average Match Score

Bar Chart (Candidate vs Score)

Pie Chart (Status Distribution)

🔐 Authentication & Authorization

JWT-based authentication

Role-based access:

👨‍💼 Recruiter

👤 Candidate

🛠 Admin

📂 Project Structure
talentiq/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── auth.py
│   ├── database.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── RecruiterDashboard.jsx
│   │   │   ├── RecruiterJobDetails.jsx
│   │   │   ├── CandidateDashboard.jsx
│
└── README.md

🚀 Installation Guide
🔹 1. Clone Repository
git clone https://github.com/your-username/talentiq.git
cd talentiq

🔹 2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs at:

http://127.0.0.1:8000

🔹 3. Frontend Setup
cd frontend
npm install
npm run dev


Frontend runs at:

http://localhost:5173

🧪 API Endpoints
Method	Endpoint	Description
POST	/login	User login
POST	/create-job	Create job
GET	/jobs	List jobs
POST	/apply/{job_id}	Apply to job
POST	/rank/{job_id}	Rank candidates
POST	/update-status/{job_id}/{resume_id}	Update candidate status
GET	/my-applications	Candidate applications
POST	/match/{job_id}	Calculate match score
POST	/skill-gap/{job_id}	Skill gap analysis
🏆 Key Learning Outcomes

Built production-level full-stack application

Implemented AI-based ranking system

Designed recruiter workflow automation

Integrated secure JWT authentication

Developed interactive analytics dashboards

Managed relational database relationships

💡 Future Improvements

Email notifications on shortlist

Resume scoring breakdown explanation

Pagination for large datasets

Docker deployment

Cloud deployment (Render / Vercel)

Admin analytics dashboard

📸 Screenshots

(Add screenshots of:)

Recruiter Dashboard

Candidate Dashboard

AI Ranking Page

Analytics Charts

📜 License

This project is built for educational and portfolio purposes.

👩‍💻 Author

Veeta
AI & Full Stack Developer
Hyderabad, India

🌟 Final Note

This project demonstrates how AI and full-stack engineering can automate hiring workflows and improve recruitment efficiency through intelligent candidate ranking.
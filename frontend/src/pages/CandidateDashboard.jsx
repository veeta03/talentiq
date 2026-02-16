import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CandidateDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [matchScores, setMatchScores] = useState({});
  const [skillGaps, setSkillGaps] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);

  // 🔥 Check if resume exists
  const checkResume = async () => {
    try {
      await API.get("/my-resume");
      setHasResume(true);
    } catch {
      setHasResume(false);
    }
  };

  // 🔥 Fetch Jobs
  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 Fetch Applications
  const fetchApplications = async () => {
  try {
    const res = await API.get("/my-applications");
    setApplications([...res.data]); // 🔥 force fresh state update
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
  if (activeTab === "applications") {
    fetchApplications();
    fetchJobs();
    checkResume();
  }
}, [activeTab]);


  // 🔥 Resume Upload
  const handleUpload = async () => {
    if (!selectedFile) return setMessage("Select a PDF file.");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      const res = await API.post("/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message);
      setHasResume(true); // 🔥 enable buttons immediately
    } catch (err) {
      setMessage("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Apply
  const handleApply = async (jobId) => {
  try {
    const res = await API.post(`/apply/${jobId}`);
    setMessage(res.data.message);

    await fetchApplications();   // 🔥 wait for refresh
    setActiveTab("applications"); // 🔥 switch tab automatically

  } catch (err) {
    setMessage(err.response?.data?.detail || "Cannot apply.");
  }
};


  // 🔥 Match Score
  const handleMatch = async (jobId) => {
    try {
      const res = await API.post(`/match/${jobId}`);
      const percent = parseInt(res.data.match_percentage);

      setMatchScores((prev) => ({
        ...prev,
        [jobId]: percent,
      }));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Upload resume first.");
    }
  };

  // 🔥 Skill Gap
  const handleSkillGap = async (jobId) => {
    try {
      const res = await API.post(`/skill-gap/${jobId}`);

      setSkillGaps((prev) => ({
        ...prev,
        [jobId]: res.data,
      }));
    } catch (err) {
      setMessage(err.response?.data?.detail || "Upload resume first.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">

      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-10 text-indigo-400">
            TalentIQ
          </h2>

          <ul className="space-y-4">
            <li
              onClick={() => setActiveTab("jobs")}
              className={`cursor-pointer ${activeTab === "jobs" ? "text-indigo-400" : "text-slate-400"}`}
            >
              Jobs
            </li>
            <li
              onClick={() => setActiveTab("applications")}
              className={`cursor-pointer ${activeTab === "applications" ? "text-indigo-400" : "text-slate-400"}`}
            >
              My Applications
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-10 overflow-y-auto">

        {message && (
          <div className="mb-6 bg-indigo-500/20 text-indigo-300 p-3 rounded-lg">
            {message}
          </div>
        )}

        {/* 🔥 Resume Upload */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-10 shadow-lg">
          <h3 className="text-xl font-semibold mb-4">
            Upload Resume
          </h3>

          {!hasResume && (
            <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">
              Upload resume to enable Apply, Match Score & Skill Gap.
            </div>
          )}

          {hasResume && (
            <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4">
              Resume uploaded ✔
            </div>
          )}

          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="mb-4"
          />

          <button
            onClick={handleUpload}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {/* 🔥 Jobs */}
        {activeTab === "jobs" && (
          <>
            <h1 className="text-3xl font-bold mb-6">Available Jobs</h1>

            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {job.title}
                  </h3>

                  <p className="text-indigo-400 mb-4">
                    {job.required_skills}
                  </p>

                  <div className="flex gap-3 mb-4 flex-wrap">
                    <button
                      disabled={!hasResume}
                      onClick={() => handleApply(job.id)}
                      className={`px-4 py-2 rounded-lg ${
                        hasResume
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </button>

                    <button
                      disabled={!hasResume}
                      onClick={() => handleMatch(job.id)}
                      className={`px-4 py-2 rounded-lg ${
                        hasResume
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Match Score
                    </button>

                    <button
                      disabled={!hasResume}
                      onClick={() => handleSkillGap(job.id)}
                      className={`px-4 py-2 rounded-lg ${
                        hasResume
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Skill Gap
                    </button>
                  </div>

                  {/* Match Progress */}
                  {matchScores[job.id] && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Match</span>
                        <span>{matchScores[job.id]}%</span>
                      </div>
                      <div className="w-full bg-slate-700 h-3 rounded-full">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${matchScores[job.id]}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Skill Gap */}
                  {skillGaps[job.id] && (
                    <div className="bg-slate-800 p-4 rounded-lg text-sm">
                      <p className="text-green-400 mb-2">
                        Matched: {skillGaps[job.id].matched_skills.join(", ")}
                      </p>
                      <p className="text-red-400 mb-2">
                        Missing: {skillGaps[job.id].missing_skills.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Applications */}
        {activeTab === "applications" && (
          <>
            <h1 className="text-3xl font-bold mb-6">
              My Applications
            </h1>

            {applications.length === 0 ? (
              <p>No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-xl"
                  >
                    <h3 className="text-lg font-semibold">
                      {app.job_title}
                    </h3>
                    <p className="text-indigo-400">
                      Status: {app.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;

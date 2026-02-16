import { useEffect, useState } from "react";
import API from "../api/axios";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const RecruiterDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    required_skills: "",
  });

  // ---------------- LOAD JOBS ----------------
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const res = await API.get("/my-jobs");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- CREATE JOB ----------------
  const handleCreateJob = async () => {
    try {
      setLoading(true);

      await API.post(
        `/create-job?title=${newJob.title}&description=${newJob.description}&required_skills=${newJob.required_skills}`
      );

      setMessage("Job created successfully 🚀");
      setNewJob({ title: "", description: "", required_skills: "" });
      loadJobs();
    } catch (err) {
      setMessage("Error creating job.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RANK ----------------
  const handleRank = async (jobId) => {
    try {
      setSelectedJob(jobId);
      setApplications([]);

      await API.post(`/rank/${jobId}`);
      await fetchApplications(jobId);

      setMessage("Candidates ranked successfully 🚀");
    } catch (err) {
      setMessage("Ranking failed.");
    }
  };

  // ---------------- FETCH APPLICATIONS ----------------
  const fetchApplications = async (jobId) => {
    try {
      setSelectedJob(jobId);
      const res = await API.get(`/job-applications/${jobId}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- UPDATE STATUS ----------------
  const handleStatusUpdate = async (jobId, userId, status) => {
    try {
      await API.post(`/update-status/${jobId}/${userId}`, { status });
      setMessage("Status updated successfully");
      fetchApplications(jobId);
    } catch (err) {
      setMessage("Status update failed.");
    }
  };

  // ---------------- VIEW RESUME ----------------
  const handleViewResume = async (resumeId) => {
    if (!resumeId) {
      setMessage("Resume not available");
      return;
    }

    try {
      const response = await API.get(
        `/download-resume/${resumeId}`,
        { responseType: "blob" }
      );

      const file = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileURL = URL.createObjectURL(file);
      window.open(fileURL);
    } catch (error) {
      setMessage("Unable to open resume");
    }
  };

  // ---------------- DOWNLOAD RESUME ----------------
  const handleDownloadResume = async (resumeId) => {
    if (!resumeId) {
      setMessage("Resume not available");
      return;
    }

    try {
      const response = await API.get(
        `/download-resume/${resumeId}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setMessage("Download failed");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ---------------- STATUS COLORS ----------------
  const getStatusColor = (status) => {
    if (status === "shortlisted") return "text-green-400";
    if (status === "rejected") return "text-red-400";
    return "text-yellow-400";
  };
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white flex">

    {/* Sidebar */}
    <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col justify-between shadow-2xl">

      <div>
        <h2 className="text-2xl font-bold mb-12 text-indigo-400 tracking-tight">
          Recruiter Panel
        </h2>

        <ul className="space-y-6 text-sm font-medium">
          <li
            onClick={() => navigate("/recruiter")}
            className="cursor-pointer text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300"
          >
            Dashboard
          </li>

          <li
            onClick={() => navigate("/analytics")}
            className="cursor-pointer text-slate-400 hover:text-white hover:translate-x-1 transition-all duration-300"
          >
            Analytics
          </li>
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="bg-gradient-to-r from-red-600 to-red-500 hover:scale-105 active:scale-95 transition-all duration-300 py-2 rounded-xl font-semibold shadow-lg"
      >
        Logout
      </button>
    </div>

    {/* Main */}
    <div className="flex-1 p-10 overflow-y-auto">

      {message && (
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/30 backdrop-blur p-4 rounded-xl animate-pulse">
          {message}
        </div>
      )}

      {/* Create Job */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl mb-12 shadow-2xl hover:border-indigo-500/40 transition-all duration-300">

        <h3 className="text-2xl font-semibold mb-6 tracking-tight">
          Create New Job
        </h3>

        <input
          placeholder="Job Title"
          className="w-full mb-4 p-3 bg-slate-800/60 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-xl transition-all duration-300"
          value={newJob.title}
          onChange={(e) =>
            setNewJob({ ...newJob, title: e.target.value })
          }
        />

        <textarea
          placeholder="Description"
          className="w-full mb-4 p-3 bg-slate-800/60 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-xl transition-all duration-300"
          value={newJob.description}
          onChange={(e) =>
            setNewJob({ ...newJob, description: e.target.value })
          }
        />

        <input
          placeholder="Required Skills"
          className="w-full mb-4 p-3 bg-slate-800/60 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none rounded-xl transition-all duration-300"
          value={newJob.required_skills}
          onChange={(e) =>
            setNewJob({
              ...newJob,
              required_skills: e.target.value,
            })
          }
        />

        <button
          onClick={handleCreateJob}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 active:scale-95 transition-all duration-300 px-6 py-3 rounded-xl font-semibold shadow-xl"
        >
          {loading ? "Creating..." : "Create Job"}
        </button>
      </div>

      {/* Jobs */}
      <h2 className="text-3xl font-bold mb-8 tracking-tight">
        My Jobs
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:border-indigo-500/40 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold mb-3">
              {job.title}
            </h3>

            <p className="text-indigo-400 mb-6 text-sm">
              {job.required_skills}
            </p>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleRank(job.id)}
                className="bg-green-600/90 hover:bg-green-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium shadow-md"
              >
                Rank
              </button>

              <button
                onClick={() => fetchApplications(job.id)}
                className="bg-yellow-500/90 hover:bg-yellow-500 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium shadow-md"
              >
                Applications
              </button>

              <button
                onClick={() => navigate(`/job-analytics/${job.id}`)}
                className="bg-purple-600/90 hover:bg-purple-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm font-medium shadow-md"
              >
                Analytics
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Applications */}
      {selectedJob && (
        <div>
          <h2 className="text-3xl font-bold mb-6 tracking-tight">
            Applications ({applications.length})
          </h2>

          {applications.length === 0 ? (
            <p className="text-slate-400">No applicants yet.</p>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={`${app.user_id}-${selectedJob}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-lg hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {app.user_name}
                      </p>
                      <p className="text-indigo-400 text-sm">
                        Score: {app.score}%
                      </p>
                    </div>

                    <span className={`${getStatusColor(app.status)} font-medium`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleViewResume(app.resume_id)}
                      className="bg-blue-600/90 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm shadow-md"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDownloadResume(app.resume_id)}
                      className="bg-indigo-600/90 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm shadow-md"
                    >
                      Download
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          selectedJob,
                          app.user_id,
                          "shortlisted"
                        )
                      }
                      className="bg-green-600/90 hover:bg-green-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm shadow-md"
                    >
                      Shortlist
                    </button>

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          selectedJob,
                          app.user_id,
                          "rejected"
                        )
                      }
                      className="bg-red-600/90 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all duration-300 px-4 py-2 rounded-xl text-sm shadow-md"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
};


export default RecruiterDashboard;

import { useEffect, useState } from "react";
import API from "../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await API.get("/dashboard-analytics");
        setData(res.data);
      } catch (err) {
        console.error("Analytics error:", err);
      }
    };

    fetchAnalytics();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading analytics...
      </div>
    );
  }

  // 🔥 Status Bar Chart
  const statusBarData = {
    labels: ["Applied", "Shortlisted", "Rejected"],
    datasets: [
      {
        label: "Candidates",
        data: [data.applied, data.shortlisted, data.rejected],
        backgroundColor: ["#6366f1", "#22c55e", "#ef4444"]
      }
    ]
  };

  // 🔥 Status Pie Chart
  const statusPieData = {
    labels: ["Applied", "Shortlisted", "Rejected"],
    datasets: [
      {
        data: [data.applied, data.shortlisted, data.rejected],
        backgroundColor: ["#6366f1", "#22c55e", "#ef4444"]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-10 text-indigo-400">
        📊 Recruiter Analytics Dashboard
      </h1>

      {/* 🔥 Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400">Total Jobs</p>
          <h2 className="text-3xl font-bold mt-2">{data.total_jobs}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400">Total Applications</p>
          <h2 className="text-3xl font-bold mt-2">{data.total_applications}</h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400">Shortlisted</p>
          <h2 className="text-3xl font-bold mt-2 text-green-400">
            {data.shortlisted}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <p className="text-slate-400">Average Match Score</p>
          <h2 className="text-3xl font-bold mt-2">
            {data.average_match_score}%
          </h2>
        </div>

      </div>

      {/* 🔥 Charts */}
      <div className="grid md:grid-cols-2 gap-10">

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-6 text-indigo-400">
            📈 Application Status Overview
          </h2>
          <Bar data={statusBarData} />
        </div>

        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h2 className="text-lg font-semibold mb-6 text-indigo-400">
            🥧 Application Distribution
          </h2>
          <Pie data={statusPieData} />
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;

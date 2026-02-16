import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const JobAnalytics = () => {
  const { jobId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await API.get(`/job-analytics/${jobId}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadAnalytics();
  }, [jobId]);

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading Job Analytics...
      </div>
    );
  }

  const barData = {
    labels: ["Applied", "Shortlisted", "Rejected"],
    datasets: [
      {
        label: "Candidates",
        data: [data.applied, data.shortlisted, data.rejected],
        backgroundColor: ["#6366f1", "#22c55e", "#ef4444"],
      },
    ],
  };

  const pieData = {
    labels: ["Applied", "Shortlisted", "Rejected"],
    datasets: [
      {
        data: [data.applied, data.shortlisted, data.rejected],
        backgroundColor: ["#6366f1", "#22c55e", "#ef4444"],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <h1 className="text-3xl font-bold mb-8 text-indigo-400">
        📊 {data.job_title} - Analytics
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">

        <div className="bg-slate-900 p-6 rounded-xl">
          <p>Total Applications</p>
          <h2 className="text-3xl font-bold mt-2">
            {data.total_applications}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p>Shortlisted</p>
          <h2 className="text-3xl font-bold text-green-400 mt-2">
            {data.shortlisted}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p>Rejected</p>
          <h2 className="text-3xl font-bold text-red-400 mt-2">
            {data.rejected}
          </h2>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <p>Average Match</p>
          <h2 className="text-3xl font-bold mt-2">
            {data.average_score}%
          </h2>
        </div>

      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-10">

        <div className="bg-slate-900 p-6 rounded-xl">
          <Bar data={barData} />
        </div>

        <div className="bg-slate-900 p-6 rounded-xl">
          <Pie data={pieData} />
        </div>

      </div>

    </div>
  );
};

export default JobAnalytics;

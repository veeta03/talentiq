import { useEffect, useState } from "react";
import API from "../api/axios";

function MyApplications() {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    API.get("/my-applications")
      .then((res) => setApps(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="dashboard">
      <h2>My Applications</h2>

      <div className="grid">
        {apps.map((app) => (
          <div key={app.id} className="card">
            <h4>{app.job_title}</h4>
            <p>Status: {app.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyApplications;

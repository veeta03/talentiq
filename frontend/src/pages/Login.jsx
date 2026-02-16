import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("Login clicked");


    const result = await login(email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // 🔥 Role-based redirect
    if (result.role === "candidate") {
      navigate("/candidate");
    } else if (result.role === "recruiter") {
      navigate("/recruiter");
    } else if (result.role === "admin") {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">

        <h2 className="text-3xl font-bold text-white text-center mb-6">
          TalentIQ ATS Login
        </h2>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-white py-2 rounded-lg font-semibold"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;

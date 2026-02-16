import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h2>TalentIQ</h2>
      <div>
        <Link to="/candidate">Candidate</Link>
        <Link to="/recruiter">Recruiter</Link>
        <Link to="/applications">My Apps</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;

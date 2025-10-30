import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // remove JWT
    navigate("/login"); // redirect to login
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
      <Link to="/dashboard" className="text-xl font-bold text-blue-400 hover:text-blue-500">
        Task Organizer
      </Link>

      <div className="flex items-center gap-5">
        <Link
          to="/dashboard"
          className="hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

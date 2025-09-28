import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/logo.jpg";

function Nevbar() {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };
  return (
    <nav className="bg-white shadow-lg border-b-4 border-gold fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="ByteBattle Logo" 
              className="h-16 w-16 rounded-full shadow-md border-2 border-gold"
            />
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gold">ByteBattle</h1>
              <p className="text-sm text-gray-600">Quiz Championship</p>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <Link to="/team/all_teams">
              <span className="text-lg font-medium text-gray-700 hover:text-gold transition-colors duration-200 hover:scale-105 transform">
                Teams
              </span>
            </Link>
            <Link to="/match/all_matches">
              <span className="text-lg font-medium text-gray-700 hover:text-gold transition-colors duration-200 hover:scale-105 transform">
                Matches
              </span>
            </Link>
            <Link to="/question/all_questions">
              <span className="text-lg font-medium text-gray-700 hover:text-gold transition-colors duration-200 hover:scale-105 transform">
                Questions
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-lg font-medium text-red-600 hover:text-red-700 transition-colors duration-200 hover:scale-105 transform"
            >
              Logout ({user?.username})
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Nevbar;

import { Link as RouterLink } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-gold-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-8">
        <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-400 mb-6">
          Welcome to
        </h1>
        <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-8">
          ByteBattle Quiz
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Experience the ultimate quiz championship with real-time buzzer system, 
          live scoreboards, and competitive team battles.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <RouterLink to="/register">
            <button className="btn-primary w-48 py-4 text-lg shadow-gold-lg">
              Get Started
            </button>
          </RouterLink>
          <RouterLink to="/login">
            <button className="btn-secondary w-48 py-4 text-lg">
              Login
            </button>
          </RouterLink>
        </div>
      </div>
    </div>
  );
}

export default Home;

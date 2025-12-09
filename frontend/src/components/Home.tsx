import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden py-10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-block mb-6">
            <span className="text-6xl">⚡</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold via-yellow-400 to-gold mb-4 animate-gradient">
            ByteBattle
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Quiz Championship Platform
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Host competitive quiz battles with real-time buzzers, live scoring,
            and AI-powered questions
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Real-Time Buzzers
            </h3>
            <p className="text-gray-300">
              Lightning-fast buzzer system with mobile support for instant team
              responses
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Live Scoreboard
            </h3>
            <p className="text-gray-300">
              Track team performance with dynamic scoring and real-time
              leaderboards
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300 hover:scale-105">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI Questions</h3>
            <p className="text-gray-300">
              Generate custom questions from PDFs, URLs, or text using AI
              technology
            </p>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          <RouterLink to="/register">
            <button className="bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-white font-bold py-4 px-10 rounded-full text-lg shadow-2xl hover:shadow-gold/50 transition-all duration-300 transform hover:scale-110">
              🚀 Get Started
            </button>
          </RouterLink>
          <RouterLink to="/login">
            <button className="bg-white/10 backdrop-blur-lg hover:bg-white/20 text-white border-2 border-white/30 hover:border-gold font-bold py-4 px-10 rounded-full text-lg transition-all duration-300 transform hover:scale-110">
              🔐 Login
            </button>
          </RouterLink>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-gray-400 text-sm">Team Management</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <p className="text-gray-400 text-sm">Mobile Friendly</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">⚡</div>
            <p className="text-gray-400 text-sm">Real-Time Sync</p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-gray-400 text-sm">Custom Questions</p>
          </div>
        </motion.div>
      </div>

      {/* Animated gradient background */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}

export default Home;

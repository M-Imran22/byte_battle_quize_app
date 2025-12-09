import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useAllTeams from "../teams/hooks/useAllTeams";
import useAllMatches from "../match/hooks/useAllMatches";
import useAllQuestions from "../questions/hooks/uesAllQustions";

function Dashboard() {
  const { user } = useAuth();
  const { data: teams } = useAllTeams();
  const { data: matches } = useAllMatches();
  const { data: questions } = useAllQuestions();

  const teamsList = teams || [];
  const matchesList = matches || [];
  const questionsList = questions || [];

  const stats = [
    {
      label: "Total Teams",
      value: teamsList.length,
      icon: "👥",
      color: "from-gold-400 to-gold-600",
      link: "/team/all_teams",
    },
    {
      label: "Total Matches",
      value: matchesList.length,
      icon: "🏆",
      color: "from-gold to-yellow-500",
      link: "/match/all_matches",
    },
    {
      label: "Total Questions",
      value: questionsList.length,
      icon: "❓",
      color: "from-gold-500 to-gold-700",
      link: "/question/all_questions",
    },
    {
      label: "Active Matches",
      value: matchesList.filter((m: any) => m.match_name).length,
      icon: "⚡",
      color: "from-yellow-400 to-gold-500",
      link: "/match/all_matches",
    },
  ];

  const quickActions = [
    {
      label: "Create Team",
      icon: "➕",
      link: "/team/add_team",
      color: "bg-gold hover:bg-gold-600",
    },
    {
      label: "New Match",
      icon: "🎮",
      link: "/match/add_match",
      color: "bg-gold-600 hover:bg-gold-700",
    },
    {
      label: "Add Question",
      icon: "📝",
      link: "/question/add_question",
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      label: "AI Generator",
      icon: "🤖",
      link: "/question/ai_generator",
      color: "bg-yellow-600 hover:bg-yellow-700",
    },
  ];

  const recentMatches = matchesList.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-gold-100 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome back,{" "}
          <span className="text-gold">{user?.username || "User"}</span>! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your quiz platform today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 shadow-2xl cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="text-5xl opacity-80">{stat.icon}</div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-2xl p-6 border-2 border-gold-200 shadow-gold-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚡</span> Quick Actions
            </h2>
            <div>
              {quickActions.map((action, index) => (
                <Link key={index} to={action.link}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full ${action.color} text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-between shadow-lg my-2 `}
                  >
                    <span>{action.label}</span>
                    <span className="text-2xl">{action.icon}</span>
                  </motion.button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl p-6 border-2 border-gold-200 shadow-gold-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">🏆</span> Recent Matches
              </h2>
              <Link
                to="/match/all_matches"
                className="text-gold hover:text-gold-600 text-sm font-semibold"
              >
                View All →
              </Link>
            </div>

            {recentMatches.length > 0 ? (
              <div className="space-y-3">
                {recentMatches.map((match: any) => (
                  <Link key={match.id} to={`/match/${match.id}/scoreboard`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gold-50 hover:bg-gold-100 rounded-lg p-4 border border-gold-200 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-gray-800 font-semibold text-lg">
                            {match.match_name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Type: {match.match_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gold font-bold text-lg">
                            {match.rounds?.length || 0} Teams
                          </p>
                          <p className="text-gray-600 text-sm">Participating</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No matches yet</p>
                <Link to="/match/add_match">
                  <button className="mt-4 bg-gold hover:bg-gold-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200">
                    Create Your First Match
                  </button>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Teams Overview */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-200 shadow-gold-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">👥</span> Teams Overview
          </h2>
          {teamsList.length > 0 ? (
            <div className="space-y-2">
              {teamsList.slice(0, 5).map((team: any) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between bg-gold-50 rounded-lg p-3 border border-gold-200"
                >
                  <span className="text-gray-800 font-medium">
                    {team.team_name}
                  </span>
                  <span className="text-gray-600 text-sm">
                    {team.description}
                  </span>
                </div>
              ))}
              {teamsList.length > 5 && (
                <Link
                  to="/team/all_teams"
                  className="block text-center text-gold hover:text-gold-600 text-sm font-semibold mt-3"
                >
                  View {teamsList.length - 5} more teams →
                </Link>
              )}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              No teams created yet
            </p>
          )}
        </div>

        {/* Question Bank */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gold-200 shadow-gold-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <span className="mr-2">📚</span> Question Bank
          </h2>
          <div className="space-y-4">
            <div className="bg-gold-50 rounded-lg p-4 border border-gold-200 mb-5">
              <p className="text-3xl font-bold text-gold">
                {questionsList.length}
              </p>
              <p className="text-gray-600 text-sm">Total Questions Available</p>
            </div>
            <Link to="/question/add_question">
              <button className="w-full bg-gold hover:bg-gold-600 text-white mb-2 font-semibold py-3 rounded-lg transition-all duration-200">
                Add Manual Question
              </button>
            </Link>
            <Link to="/question/ai_generator">
              <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white mb-2 font-semibold py-3 rounded-lg transition-all duration-200">
                Generate with AI
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;

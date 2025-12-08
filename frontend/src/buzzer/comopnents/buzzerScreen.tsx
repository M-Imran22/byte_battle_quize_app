import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "../../services/axios";
import useBuzzerMutation, {
  TeamFormData,
  teamSchema,
} from "../hooks/useBuzzer";

const BuzzerPage = () => {
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [matchTeams, setMatchTeams] = useState<any[]>([]);
  const { mutateAsync } = useBuzzerMutation();

  // Fetch all teams for buzzer selection
  useEffect(() => {
    const fetchAllTeams = async () => {
      try {
        // Fetch all teams from the public endpoint
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${backendUrl}/api/public/teams`);
        if (response.ok) {
          const data = await response.json();
          setMatchTeams(data.teams || []);
        } else {
          // Fallback teams if API fails
          setMatchTeams([
            { id: 1, team_name: "codecrafter(defualt)" },
            { id: 2, team_name: "Legend Coder(defualt)" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
        // Fallback teams
        setMatchTeams([
          { id: 1, team_name: "codecrafter(defualt)" },
          { id: 2, team_name: "Legend Coder(defualt)" },
        ]);
      }
    };
    fetchAllTeams();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  const handleFormSubmit = ({ teamName }: TeamFormData) => {
    setTeamName(teamName);
    setShowBuzzer(true);
  };

  const handleBuzzerPress = async () => {
    setIsPressed(true);
    const timestamp = new Date().toISOString();

    // Emit real-time buzzer press FIRST
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const buzzerSocket = io(backendUrl);

    buzzerSocket.on("connect", () => {
      console.log("Buzzer socket connected!");
      buzzerSocket.emit("buzzer-press", {
        teamName,
        timestamp,
      });
      console.log("Buzzer press emitted:", { teamName, timestamp });
    });

    // Listen for buzzer reset
    buzzerSocket.on("buzzers-reset", () => {
      console.log("Buzzers reset - resetting mobile buzzer");
      setIsPressed(false);
    });

    buzzerSocket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error);
    });

    await mutateAsync({
      teamName,
      timestamp,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {!showBuzzer ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                ⚡ Buzzer System
              </h1>
              <p className="text-gray-300">Enter your team name to join</p>
            </div>

            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-6"
            >
              <div>
                <select
                  {...register("teamName")}
                  className="w-full px-4 py-4 bg-white/20 border border-white/30 text-white text-lg rounded-lg focus:border-gold focus:ring-4 focus:ring-gold-100 transition-all duration-200"
                >
                  <option value="" className="bg-gray-800 text-white">
                    Select your team
                  </option>
                  {matchTeams.map((team) => (
                    <option
                      key={team.id}
                      value={team.team_name}
                      className="bg-gray-800 text-white"
                    >
                      {team.team_name}
                    </option>
                  ))}
                </select>
                {errors.teamName && (
                  <p className="mt-2 text-red-400 text-sm">
                    {errors.teamName.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-4 text-lg shadow-gold"
              >
                🚀 Join the Battle
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                🏆 {teamName}
              </h2>
              <p className="text-gray-300">Ready to buzz in!</p>
            </div>

            <motion.button
              whileHover={!isPressed ? { scale: 1.05 } : {}}
              whileTap={!isPressed ? { scale: 0.95 } : {}}
              onClick={handleBuzzerPress}
              disabled={isPressed}
              className={`
                w-64 h-64 rounded-full text-white text-4xl font-bold
                transition-all duration-300 ease-out
                ${
                  isPressed
                    ? "bg-gradient-to-br from-green-400 to-green-600 cursor-not-allowed animate-pulse"
                    : "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-2xl"
                }
              `}
            >
              {isPressed ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">✓</span>
                  <span className="text-lg">BUZZED!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">⚡</span>
                  <span>BUZZ!</span>
                </div>
              )}
            </motion.button>

            {isPressed && (
              <div className="mt-8 text-center">
                <p className="text-green-400 text-xl font-semibold">
                  ✨ Buzzer activated! Wait for the host.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuzzerPage;

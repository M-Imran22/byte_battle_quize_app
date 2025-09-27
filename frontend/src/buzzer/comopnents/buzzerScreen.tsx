import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useState } from "react";
import useBuzzerMutation, {
  TeamFormData,
  teamSchema,
} from "../hooks/useBuzzer";

const BuzzerPage = () => {
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [teamName, setTeamName] = useState("");
  const { mutateAsync } = useBuzzerMutation();

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
              <h1 className="text-4xl font-bold text-white mb-2">⚡ Buzzer System</h1>
              <p className="text-gray-300">Enter your team name to join</p>
            </div>
            
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              <div>
                <input
                  {...register("teamName")}
                  placeholder="Enter team name"
                  className="w-full px-4 py-4 bg-white/20 border border-white/30 text-white placeholder-gray-300 text-lg rounded-lg focus:border-gold focus:ring-4 focus:ring-gold-100 transition-all duration-200"
                  autoComplete="off"
                />
                {errors.teamName && (
                  <p className="mt-2 text-red-400 text-sm">{errors.teamName.message}</p>
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
              <h2 className="text-3xl font-bold text-white mb-2">🏆 {teamName}</h2>
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
                ${isPressed 
                  ? 'bg-gradient-to-br from-green-400 to-green-600 cursor-not-allowed animate-pulse' 
                  : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 cursor-pointer shadow-2xl'
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
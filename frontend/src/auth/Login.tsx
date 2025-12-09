import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import useLogin, { Schema, UserLoginData } from "./useLogin";
import { useAuth } from "../contexts/AuthContext";
import { createSocket } from "../services/socket";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginData>({ resolver: zodResolver(Schema) });

  const mutation = useLogin();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (data: UserLoginData) => {
    mutation.mutate(data, {
      onSuccess: (response: any) => {
        const token = response.accessToken;
        const user = response.user || { id: 1, username: "User", email: data.email };
        login(token, user);
        createSocket();
        navigate("/dashboard");
      },
      onError: (error: any) => {
        console.error("Login error:", error);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Back to Home */}
      <Link
        to="/"
        className="absolute top-8 left-8 z-20 inline-flex items-center text-gray-300 hover:text-gold transition-colors"
      >
        <span className="mr-2">←</span> Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">
              Sign in to continue your quiz journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="johndoe@gmail.com"
                className={`w-full px-4 py-3 bg-white/20 border ${
                  errors.email ? "border-red-500" : "border-white/30"
                } text-white placeholder-gray-400 rounded-lg focus:border-gold focus:ring-4 focus:ring-gold/20 transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className={`w-full px-4 py-3 bg-white/20 border ${
                  errors.password ? "border-red-500" : "border-white/30"
                } text-white placeholder-gray-400 rounded-lg focus:border-gold focus:ring-4 focus:ring-gold/20 transition-all duration-200`}
              />
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {mutation.error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-300">
                  {mutation.error?.response?.data?.message ||
                    "Login failed. Please try again."}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-500 hover:to-gold text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {mutation.isPending ? "🔄 Signing In..." : "🚀 Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-gold hover:text-yellow-400 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;

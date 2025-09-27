import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useLogin, { Schema, UserLoginData } from "./useLogin";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginData>({ resolver: zodResolver(Schema) });

  const mutation = useLogin();

  const onSubmit = (data: UserLoginData) => {
    mutation.mutate(data);
    console.log(data.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 via-white to-gold-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card shadow-gold-lg border-2 border-gold-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                {...register("email")}
                type="email"
                placeholder="johndoe@gmail.com"
                className={`input-field bg-gray-50 ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message as string}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className={`input-field bg-gray-50 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : ''}`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message as string}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full py-3 text-lg"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="/register" className="text-gold hover:text-gold-600 font-semibold transition-colors">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

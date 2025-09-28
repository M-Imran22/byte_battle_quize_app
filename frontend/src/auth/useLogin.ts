import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import axios from "../services/axios";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";

export const Schema = z.object({
  email: z.string().email("Enter a vaild email"),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type UserLoginData = z.infer<typeof Schema>;

const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from.pathname || "/";

  return useMutation({
    mutationFn: async (data: UserLoginData) => {
      const response = await axios.post("login", data);
      console.log(response.data);
      return response.data; // Return the response data
    },
    onSuccess: (data) => {
      console.log("Login successful.");
      // Don't navigate here, let the component handle it
    },
    onError: (error) => {
      console.log("Login failed.", error.message);
    },
  });
};

export default useLogin;

import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import axios from "../services/axios";

export const UserData = z.object({
  username: z.string(),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type UserRegistrationData = z.infer<typeof UserData>;

const useRegisterUser = () => {
  return useMutation({
    mutationFn: async (data: UserRegistrationData) => {
      const response = await axios.post("/register", data);
      return response.data; // Return the response data
    },
    onSuccess: (data) => {
      console.log("User added successfuly.");
      // Don't handle navigation here, let component handle it
    },
    onError: (error) => {
      console.log(error.message);
    },
  });
};

export default useRegisterUser;

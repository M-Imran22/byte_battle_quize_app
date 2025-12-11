import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/axios";

const useStartMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await axios.put(`/match/${matchId}/start`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error) => {
      console.error("Error starting match:", error);
    },
  });
};

export default useStartMatch;
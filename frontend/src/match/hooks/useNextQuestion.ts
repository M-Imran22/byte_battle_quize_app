import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/axios";

const useNextQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (matchId: string) => {
      const response = await axios.put(`/match/${matchId}/next-question`);
      return response.data;
    },
    onSuccess: (data, matchId) => {
      queryClient.invalidateQueries({ queryKey: ["current-question", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
    onError: (error) => {
      console.error("Error moving to next question:", error);
    },
  });
};

export default useNextQuestion;
import { useQuery } from "@tanstack/react-query";
import axios from "../../services/axios";

const useCurrentQuestion = (matchId: string) => {
  return useQuery({
    queryKey: ["current-question", matchId],
    queryFn: async () => {
      const response = await axios.get(`/match/${matchId}/current-question`);
      return response.data;
    },
    enabled: !!matchId,
    refetchInterval: 1000, // Refetch every second for real-time updates
  });
};

export default useCurrentQuestion;
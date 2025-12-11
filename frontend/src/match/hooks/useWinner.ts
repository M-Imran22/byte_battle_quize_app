import { useQuery } from "@tanstack/react-query";
import axios from "../../services/axios";

const useWinner = (matchId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["winner", matchId],
    queryFn: async () => {
      const response = await axios.get(`/match/${matchId}/winner`);
      return response.data;
    },
    enabled: !!matchId && enabled,
  });
};

export default useWinner;
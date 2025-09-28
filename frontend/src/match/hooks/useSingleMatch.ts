import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../services/axios";
import { Round } from "./useAllMatches";

interface Match {
  id: number;
  match_name: string;
  match_type: string;
  rounds: Round[];
}

const fetchSingleMatch = async (id: string | undefined): Promise<Match> => {
  if (!id) {
    throw new Error("Match ID is required"); // Handle case where `id` is undefined
  }

  const response = await axios.get<{ match: Match }>(`match/${id}/edit`);

  return response.data.match;
};

const useSingleMatch = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  // Return refetch function for external use
  const queryResult = useQuery<Match, Error>({
    queryKey: ["match", id],
    queryFn: () => fetchSingleMatch(id),
    enabled: !!id,
  });

  const { data, isError, isLoading, refetch } = queryResult;

  const mutation = useMutation({
    mutationFn: async (updatedRounds: Round[]) => {
      const response = axios.put(`match/${id}/update_score`, {
        rounds: updatedRounds,
      });

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", id] }); // Invalidate match query
      console.log("Score updated successfully.");
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  return { mutation, data, isError, isLoading, refetch };
};

export default useSingleMatch;

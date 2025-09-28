import { useMutation } from "@tanstack/react-query";
import axios from "../../services/axios";
import { z } from "zod";

export const teamdata = z.object({
  team_name: z.string(),
  description: z.string(),
});

export type TeamAdditionData = z.infer<typeof teamdata>;

const useAddTeam = () => {
  return useMutation({
    mutationFn: async (data: TeamAdditionData) => {
      teamdata.parse(data);
      const response = await axios.post("/team/add", data);
      return response;
    },

    onSuccess: (response) => {
      console.log("Team Added Successfully!");
      console.log(response.data);
    },
    onError: () => {
      console.log("an error is occured during the process");
    },
  });
};

export default useAddTeam;

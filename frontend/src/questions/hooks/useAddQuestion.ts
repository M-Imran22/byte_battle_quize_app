import { useMutation } from "@tanstack/react-query";
import axios from "../../services/axios";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

export const questionData = z.object({
  q_type: z.string(),
  question: z.string(),
  option_a: z.string(),
  option_b: z.string(),
  option_c: z.string(),
  option_d: z.string(),
  correct_option: z.string(),
});

export type questionDataFormat = z.infer<typeof questionData>;

const useAddQuestion = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (data: questionDataFormat) => {
      questionData.parse(data);
      const response = await axios.post("/question/add", data);
      return response;
    },
    onSuccess: (response) => {
      console.log("Question is Inserted Successfully", response.data);
      navigate("/question/all_questions");
    },
    onError: (e) => {
      console.log("Some error occurred durig question insertion", e);
    },
  });
};

export default useAddQuestion;

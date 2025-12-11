import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "../../services/axios";
// Question data format interface
interface questionDataFormat {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  q_type: string;
}

const fetchQuestion = async (id: string) => {
  const response = await axios.get(`/question/${id}/edit`);
  console.log(response.data.question);
  return response.data.question;
};
const useEditQuestion = (id: string | undefined, onSuccess: () => void) => {
  const {
    data: question,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["question", id],
    queryFn: () => fetchQuestion(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (data: questionDataFormat) => {
      const response = await axios.put(`question/${id}`, {
        question: data.question,
        option_a: data.option_a,
        option_b: data.option_b,
        option_c: data.option_c,
        option_d: data.option_d,
        correct_option: data.correct_option,
        q_type: data.q_type
      });
      return response;
    },
    onSuccess: () => {
      console.log("Question updated successfully");
      onSuccess();
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  return { mutation, question, isError, isLoading };
};

export default useEditQuestion;

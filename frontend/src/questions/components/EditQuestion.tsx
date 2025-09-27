import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import useEditQuestion from "../hooks/useEditQuestion";
import { useEffect } from "react";
import { questionDataFormat } from "../hooks/useAddQuestion";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const EditQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<questionDataFormat>();
  const { mutation, question, isError, isLoading } = useEditQuestion(id, reset);

  useEffect(() => {
    if (question) {
      reset({
        ...question,
      });
    }
  }, [question, reset]);

  const submit = (data: questionDataFormat) => {
    mutation.mutate(data, {
      onSuccess: () => {
        reset();
        navigate("/question/all_questions");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center mt-5">
        <p className="text-red-500">
          Failed to load question data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl text-center mb-6 text-gray-800">
        Edit Question
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Update the fields below to modify the question.
      </p>
      <div className="p-6 rounded-md">
        <form onSubmit={handleSubmit(submit)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Question
              </label>
              <input
                defaultValue={question?.question}
                type="text"
                placeholder="e.g., Who is the president of the USA?"
                {...register("question", {
                  required: "This field is required",
                })}
                className="input-field"
              />
              {errors.question && (
                <p className="text-red-500 text-sm mt-1">{errors.question?.message}</p>
              )}
            </div>

            {(["option_a", "option_b", "option_c", "option_d"] as const).map(
              (optionKey, index) => (
                <div key={optionKey}>
                  <label className="block font-bold text-gray-700 mb-2">
                    Option {String.fromCharCode(65 + index)}
                  </label>
                  <input
                    defaultValue={question ? question[optionKey] : ""}
                    type="text"
                    placeholder={`e.g., ${
                      index === 0
                        ? "Joe Biden"
                        : index === 1
                        ? "Donald Trump"
                        : index === 2
                        ? "Barack Obama"
                        : "Kamala Harris"
                    }`}
                    {...register(optionKey, {
                      required: `Option ${String.fromCharCode(
                        65 + index
                      )} is required`,
                    })}
                    className="input-field"
                  />
                  {errors[optionKey] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[optionKey]?.message}
                    </p>
                  )}
                </div>
              )
            )}

            <div>
              <label className="block font-bold text-gray-700 mb-2">
                Correct Option
              </label>
              <input
                defaultValue={question?.correct_option}
                type="text"
                placeholder="e.g., A"
                {...register("correct_option", {
                  required: "Correct option is required",
                })}
                className="input-field"
              />
              {errors.correct_option && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.correct_option?.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="btn-primary w-full"
            >
              Update Question
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
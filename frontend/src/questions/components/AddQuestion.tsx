import { useForm } from "react-hook-form";
import useAddQuestion, { questionDataFormat } from "../hooks/useAddQuestion";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const AddQuestion = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<questionDataFormat>();
  const { mutate } = useAddQuestion();

  const submit = (data: questionDataFormat) => {
    mutate(data);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ❓ Add New Question
          </h1>
          <p className="text-gray-600">
            Create a new question for the quiz bank
          </p>
        </div>
        
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
            <select
              {...register("q_type", {
                required: "Question type is required",
              })}
              className={`input-field text-lg py-4 ${errors.q_type ? 'border-red-500' : ''}`}
            >
              <option value="">Select question type</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Sports">Sports</option>
            </select>
            {errors.q_type && (
              <p className="mt-1 text-sm text-red-600">{errors.q_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
            <input
              type="text"
              placeholder="e.g., Who is the president of the USA?"
              {...register("question", {
                required: "This field is required",
              })}
              className={`input-field text-lg py-4 ${errors.question ? 'border-red-500' : ''}`}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["option_a", "option_b", "option_c", "option_d"] as const).map(
              (optionKey, index) => (
                <div key={optionKey}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Option {String.fromCharCode(65 + index)}
                  </label>
                  <input
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
                    className={`input-field ${errors[optionKey] ? 'border-red-500' : ''}`}
                  />
                  {errors[optionKey] && (
                    <p className="mt-1 text-sm text-red-600">{errors[optionKey]?.message}</p>
                  )}
                </div>
              )
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Correct Option</label>
            <input
              type="text"
              placeholder="Enter the correct option (A, B, C, or D)"
              {...register("correct_option", {
                required: "Correct option is required",
              })}
              className={`input-field ${errors.correct_option ? 'border-red-500' : ''}`}
            />
            {errors.correct_option && (
              <p className="mt-1 text-sm text-red-600">{errors.correct_option.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full shadow-gold"
          >
            ✨ Add Question
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default AddQuestion;
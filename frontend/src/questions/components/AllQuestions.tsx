import { Link } from "react-router-dom";
import useAllQuestoins from "../hooks/uesAllQustions";
import useDeleteQuestion from "../hooks/useDeleteQuestion";
import useAllQuestoin_type from "../hooks/useAllQuestion_type";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export const AllQuestions = () => {
  const { data: questions, isLoading, error } = useAllQuestoins();
  const { data: q_types } = useAllQuestoin_type();
  const [SelectedType, setSelectedType] = useState("");
  const { mutate: deleteQuestion } = useDeleteQuestion();

  const filteredQuestions = SelectedType
    ? questions?.filter((q) => q.q_type === SelectedType)
    : questions;

  const typeOptions = [
    { value: "", label: "All Types" },
    ...(q_types?.map((t) => ({
      value: t.question_type,
      label: t.question_type,
    })) || []),
  ];

  const handleDeleteQuestion = (id: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      deleteQuestion(id, {
        onSuccess: () => {
          console.log(`Question with ID ${id} has been deleted successfully.`);
        },
        onError: (error: any) => {
          console.error(
            `Failed to delete question with ID ${id}. ${error.message}`
          );
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 text-lg font-semibold">
          Failed to load questions. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🤔 Question Bank
            </h1>
            <p className="text-gray-600">Manage quiz questions and categories</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative">
              <select
                value={SelectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field pr-10 min-w-48"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-3">
              <Link to="/question/add_question">
                <Button size="lg" className="shadow-gold whitespace-nowrap">
                  <span className="mr-2">+</span>
                  Add Question
                </Button>
              </Link>
              <Link to="/question/ai_generator">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg whitespace-nowrap">
                  <span className="mr-2">🤖</span>
                  AI Generator
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {filteredQuestions && filteredQuestions.length > 0 ? (
          <div className="bg-white rounded-lg border border-gold-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gold-50 to-gold-100 text-gold-800 font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Question</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Correct</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuestions.map((question) => (
                    <tr key={question.id} className="hover:bg-gold-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="font-semibold text-gold">#{question.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.q_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-800 truncate" title={question.question}>
                            {question.question}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                          {question.correct_option}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <Link to={`/question/${question.id}/edit`}>
                            <Button variant="secondary" size="sm" className="text-xs">
                              ✏️ Edit
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            🗑️ Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {SelectedType ? `No ${SelectedType} questions found` : 'No questions yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {SelectedType ? 'Try selecting a different category' : 'Create your first question to get started'}
            </p>
            <Link to="/question/add_question">
              <Button>
                Create First Question
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AllQuestions;
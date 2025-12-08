import { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import axios from "../../services/axios";

interface AIQuestionForm {
  contentType: 'url' | 'pdf' | 'text';
  content: string;
  questionCount: number;
  questionType: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const AIQuestionGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AIQuestionForm>({
    defaultValues: {
      contentType: 'text',
      questionCount: 5,
      questionType: 'General Knowledge',
      difficulty: 'Medium'
    }
  });

  const contentType = watch('contentType');

  const onSubmit = async (data: AIQuestionForm) => {
    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      const formData = new FormData();
      formData.append('contentType', data.contentType);
      formData.append('content', data.content);
      formData.append('questionCount', data.questionCount.toString());
      formData.append('questionType', data.questionType);
      formData.append('difficulty', data.difficulty);

      if (data.contentType === 'pdf' && pdfFile) {
        formData.append('pdfFile', pdfFile);
      }

      const response = await axios.post('/ai-question/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setGeneratedQuestions(response.data.questions);
      alert(`✅ ${response.data.questions.length} questions generated successfully!`);
    } catch (error: any) {
      console.error('Generation failed:', error);
      alert('❌ Failed to generate questions: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🤖 AI Question Generator
          </h1>
          <p className="text-gray-600">
            Generate MCQs from websites, PDFs, or text using AI
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Source
            </label>
            <select
              {...register('contentType', { required: 'Content type is required' })}
              className="input-field"
            >
              <option value="text">📝 Text Content</option>
              <option value="url">🌐 Website URL</option>
              <option value="pdf">📄 PDF Upload</option>
            </select>
          </div>

          {/* Content Input */}
          {contentType === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Content
              </label>
              <textarea
                {...register('content', { required: 'Content is required' })}
                placeholder="Paste your content here..."
                rows={6}
                className={`input-field ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
          )}

          {contentType === 'url' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                {...register('content', { required: 'URL is required' })}
                placeholder="https://example.com/article"
                className={`input-field ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>
          )}

          {contentType === 'pdf' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDF File
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="input-field"
                required
              />
            </div>
          )}

          {/* Generation Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                min="1"
                max="50"
                {...register('questionCount', { 
                  required: 'Question count is required',
                  min: { value: 1, message: 'Minimum 1 question' },
                  max: { value: 50, message: 'Maximum 50 questions' }
                })}
                className={`input-field ${errors.questionCount ? 'border-red-500' : ''}`}
              />
              {errors.questionCount && (
                <p className="mt-1 text-sm text-red-600">{errors.questionCount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Type
              </label>
              <select {...register('questionType')} className="input-field">
                <option value="General Knowledge">General Knowledge</option>
                <option value="English">English</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select {...register('difficulty')} className="input-field">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-gold"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Generating Questions...
              </>
            ) : (
              <>🚀 Generate Questions</>
            )}
          </Button>
        </form>

        {/* Generated Questions Preview */}
        {generatedQuestions.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gold-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ✅ Generated Questions ({generatedQuestions.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedQuestions.map((q, index) => (
                <div key={q.id} className="bg-gold-50 p-4 rounded-lg border border-gold-200">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {index + 1}. {q.question}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>A) {q.option_a}</div>
                    <div>B) {q.option_b}</div>
                    <div>C) {q.option_c}</div>
                    <div>D) {q.option_d}</div>
                  </div>
                  <div className="mt-2 text-sm font-medium text-green-600">
                    ✓ Correct: {q.correct_option}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AIQuestionGenerator;
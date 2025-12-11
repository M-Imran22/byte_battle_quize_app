import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import axios from "../../services/axios";

interface ExcelImportForm {
  excelFile: FileList;
}

const ExcelQuestionImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExcelImportForm>();

  const downloadTemplate = async () => {
    try {
      const response = await axios.get('/ai-question/excel-template', {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'question_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      alert('❌ Failed to download template');
    }
  };

  const onSubmit = async (data: ExcelImportForm) => {
    if (!data.excelFile || data.excelFile.length === 0) {
      alert('Please select an Excel file');
      return;
    }

    setIsImporting(true);
    setImportedQuestions([]);
    setImportResult("");

    try {
      const formData = new FormData();
      formData.append('excelFile', data.excelFile[0]);

      const response = await axios.post('/ai-question/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setImportedQuestions(response.data.questions);
      let resultMessage = `✅ ${response.data.count} questions imported successfully!`;
      
      if (response.data.duplicates && response.data.duplicates.length > 0) {
        resultMessage += `\n\n⚠️ Duplicates skipped (${response.data.duplicates.length}):\n${response.data.duplicates.join('\n')}`;
      }
      
      setImportResult(resultMessage);
      reset();
    } catch (error: any) {
      console.error('Import failed:', error);
      const errorMessage = error.response?.data?.details 
        ? `❌ Import failed:\n${error.response.data.details.join('\n')}`
        : `❌ Failed to import questions: ${error.response?.data?.error || error.message}`;
      setImportResult(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Excel Question Importer
          </h1>
          <p className="text-gray-600">
            Import multiple questions from Excel file
          </p>
        </div>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800">📋 Need a template?</h3>
              <p className="text-blue-600 text-sm">Download our Excel template with the correct format</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={downloadTemplate}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            >
              📥 Download Template
            </Button>
          </div>
        </div>

        {/* Excel Format Guide */}
        <div className="mb-6 p-4 bg-gold-50 border border-gold-200 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">📝 Excel Format Required:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Column A:</strong> Question Type (e.g., Science, Math, History)</p>
            <p><strong>Column B:</strong> Question Text</p>
            <p><strong>Column C:</strong> Option A</p>
            <p><strong>Column D:</strong> Option B</p>
            <p><strong>Column E:</strong> Option C</p>
            <p><strong>Column F:</strong> Option D</p>
            <p><strong>Column G:</strong> Correct Option (A, B, C, or D)</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File (.xlsx or .xls)
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              {...register('excelFile', { required: 'Excel file is required' })}
              className={`input-field ${errors.excelFile ? 'border-red-500' : ''}`}
            />
            {errors.excelFile && (
              <p className="mt-1 text-sm text-red-600">{errors.excelFile.message}</p>
            )}
          </div>

          {/* Import Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-gold"
            disabled={isImporting}
          >
            {isImporting ? (
              <>
                <span className="animate-spin mr-2">⚙️</span>
                Importing Questions...
              </>
            ) : (
              <>📤 Import Questions</>
            )}
          </Button>
        </form>

        {/* Import Result */}
        {importResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            importResult.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <pre className="whitespace-pre-wrap text-sm">{importResult}</pre>
          </div>
        )}

        {/* Imported Questions Preview */}
        {importedQuestions.length > 0 && (
          <div className="mt-8 pt-8 border-t border-gold-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              ✅ Imported Questions ({importedQuestions.length})
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {importedQuestions.map((q, index) => (
                <div key={q.id} className="bg-gold-50 p-4 rounded-lg border border-gold-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">
                      {index + 1}. {q.question}
                    </h4>
                    <span className="text-xs bg-gold text-white px-2 py-1 rounded">
                      {q.q_type}
                    </span>
                  </div>
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
            <div className="mt-4 text-center">
              <Link to="/question/all_questions">
                <Button className="bg-gold hover:bg-gold-600 text-white">
                  📋 View All Questions
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExcelQuestionImporter;
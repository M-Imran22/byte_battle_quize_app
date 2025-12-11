import { useForm } from "react-hook-form";
import { matchDataFormat } from "../hooks/useAddMatch";
import useAllTeams from "../../teams/hooks/useAllTeams";
import { useEffect, useState } from "react";
import useAllQuestoin_type from "../../questions/hooks/useAllQuestion_type";
import useAddMatch from "../hooks/useAddMatch";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

export const AddMatch = () => {
  const { handleSubmit, register } = useForm<matchDataFormat>();
  const { mutate } = useAddMatch();
  const { data: teams, isLoading, isError } = useAllTeams();
  const { data: q_types } = useAllQuestoin_type();
  const [teamSections, setTeamSections] = useState<
    { id: string; value: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("");

  const typeOptions = [
    { value: "", lable: "All Types" },
    ...(q_types?.map((t) => ({
      value: t.question_type,
      lable: t.question_type,
    })) || []),
  ];

  const submit = (data: matchDataFormat) => {
    const invalidTeams = teamSections.some((section) => !section.value);
    if (invalidTeams) {
      setError("Please select a team for each dropdown.");
      return;
    }
    setError(null);
    const teamIds = teamSections.map((section) => section.value);
    const submitData = {
      ...data,
      team_ids: teamIds,
    };
    console.log(submitData);
    mutate(submitData);
  };

  const handleAddTeam = () => {
    const newTeamDiv = { id: Date.now().toString(), value: "" };
    setTeamSections((prev) => [...prev, newTeamDiv]);
  };

  const handleTeamChange = (id: string, value: string) => {
    setTeamSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, value } : section
      )
    );
  };

  const handleRemoveTeam = (id: string) => {
    setTeamSections((prev) => prev.filter((section) => section.id !== id));
  };

  useEffect(() => {
    if (teamSections.every((section) => section.value)) {
      setError(null);
    }
  }, [teamSections]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent"></div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 text-lg font-semibold">
          Error fetching teams. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏆 Create New Match
          </h1>
          <p className="text-gray-600">
            Set up a new quiz match with competing teams
          </p>
        </div>
        
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Match Name</label>
            <input
              type="text"
              placeholder="Enter match name"
              {...register("match_name", { required: true })}
              className="input-field text-lg py-4"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
              <select
                {...register("match_type", { required: true })}
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="input-field"
              >
                <option value="">Select match type</option>
                <option value="ICT">ICT</option>
                <option value="General Knowledge">General Knowledge</option>
                <option value="English">English</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Sports">Sports</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Current Affairs">Current Affairs</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
              <input
                type="number"
                min="1"
                max="50"
                placeholder="10"
                {...register("question_count", { required: true, min: 1 })}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teams</label>
              <Button
                type="button"
                onClick={handleAddTeam}
                variant="secondary"
                className="w-full"
              >
                + Add Team
              </Button>
            </div>
          </div>

          {teamSections.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Selected Teams</h3>
              {teamSections.map((section, index) => (
                <div key={section.id} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team {index + 1}
                    </label>
                    <select
                      value={section.value}
                      onChange={(e) =>
                        handleTeamChange(section.id, e.target.value)
                      }
                      className="input-field"
                    >
                      <option value="">Select a team</option>
                      {teams?.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.team_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveTeam(section.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 shadow-gold"
            >
              ✨ Create Match
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddMatch;
import { useForm } from "react-hook-form";
import { matchDataFormat } from "../hooks/useAddMatch";
import useAllTeams from "../../teams/hooks/useAllTeams";
import { useEffect, useState } from "react";
import useEditMatch from "../hooks/useEditMatch";
import { useParams } from "react-router-dom";
import useSingleMatch from "../hooks/useSingleMatch";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

export const EditMatch = () => {
  const { id } = useParams();
  const { handleSubmit, register } = useForm<matchDataFormat>();
  const { mutate } = useEditMatch(id);
  const { data: match } = useSingleMatch(id);
  const { data: teams, isLoading, isError } = useAllTeams();
  const [teamSections, setTeamSections] = useState<
    { id: string; value: string }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

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
      <div className="text-center mt-6">
        <Spinner />
        <p>Loading teams...</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="text-center mt-6">
        <p className="text-red-500">Error fetching teams.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-3xl text-center mb-6 text-gray-800">
        Update Match
      </h2>
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col gap-4">
          {/* Match Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Match Name</label>
            <input
              defaultValue={match?.match_name}
              type="text"
              placeholder="Enter match name"
              {...register("match_name", { required: true })}
              className="input-field"
            />
          </div>

          {/* Row with Match Type on left and Add Team on right */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Match Type</label>
              <select
                {...register("match_type", { required: true })}
                defaultValue={match?.match_type}
                className="input-field"
              >
                <option value="">
                  {match?.match_type || "Select match type"}
                </option>
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
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add Team</label>
              <Button
                onClick={handleAddTeam}
                className="btn-primary w-full"
                type="button"
              >
                Add Team
              </Button>
            </div>
          </div>

          {/* Team Sections */}
          <div>
            <div className="flex flex-col gap-2">
              {teamSections.map((section, index) => (
                <div key={section.id} className="flex gap-2">
                  <select
                    id={`team_${index}`}
                    value={section.value}
                    onChange={(e) =>
                      handleTeamChange(section.id, e.target.value)
                    }
                    className="input-field flex-1"
                  >
                    <option value="">Select a team</option>
                    {teams?.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                  <Button
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500"
                    onClick={() => handleRemoveTeam(section.id)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            {error && (
              <p className="pt-4 text-red-500 text-sm">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="btn-primary mt-6"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMatch;
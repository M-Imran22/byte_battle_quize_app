import { useForm } from "react-hook-form";
import { TeamAdditionData } from "../hooks/useAddTeam";
import { useNavigate, useParams } from "react-router-dom";
import useEditTeam from "../hooks/useEditTeam";
import { useEffect } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const EditTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamAdditionData>();

  const { mutation, team, isError, isLoading } = useEditTeam(id, reset);

  useEffect(() => {
    if (team) {
      reset({
        ...team,
      });
    }
  }, [team, reset]);

  const submit = (data: TeamAdditionData) => {
    mutation.mutate(data, {
      onSuccess: () => {
        reset();
        navigate("/team/all_teams");
      },
    });
  };

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
          Failed to load team data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ✏️ Edit Team
          </h1>
          <p className="text-gray-600">
            Update the team details below
          </p>
        </div>
        
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
            <input
              type="text"
              placeholder="Enter the team name"
              defaultValue={team?.team_name}
              {...register("team_name", {
                required: "Team name is required",
              })}
              className={`input-field text-lg py-4 ${errors.team_name ? 'border-red-500' : ''}`}
            />
            {errors.team_name && (
              <p className="mt-1 text-sm text-red-600">{errors.team_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Enter a brief description of the team"
              defaultValue={team?.description}
              {...register("description", {
                required: "Description is required",
              })}
              className={`input-field min-h-32 resize-none ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => navigate("/team/all_teams")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 shadow-gold"
            >
              ✨ Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditTeam;
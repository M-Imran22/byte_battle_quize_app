import { useForm } from "react-hook-form";
import useAddTeam, { TeamAdditionData } from "../hooks/useAddTeam";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const AddTeam = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamAdditionData>();

  const navigate = useNavigate();
  const { mutate } = useAddTeam();

  const submit = (data: TeamAdditionData) => {
    mutate(data, {
      onSuccess: () => {
        navigate("/team/all_teams");
      },
      onError: (error) => {
        console.error(error);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🏆 Add New Team
          </h1>
          <p className="text-gray-600">
            Create a new team to join the ByteBattle championship
          </p>
        </div>
        
        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
            <input
              placeholder="Enter the team name"
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
              ✨ Create Team
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTeam;
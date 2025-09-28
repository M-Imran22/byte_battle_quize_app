import useAllTeams from "../hooks/useAllTeams";
import { Link } from "react-router-dom";
import useDeleteTeam from "../hooks/useDeleteTeam";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHeaderCell,
} from "../../components/ui/Table";
import Spinner from "../../components/ui/Spinner";

function AllTeams() {
  const { data: teams, error, isLoading } = useAllTeams();
  const { mutate: deleteTeam } = useDeleteTeam();

  const handleDeleteTeam = (id: number) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      deleteTeam(id, {
        onSuccess: () => {
          console.log(`Team with ID ${id} has been deleted successfully.`);
        },
        onError: (error: any) => {
          console.error(
            `Failed to delete team with ID ${id}. ${error.message}`
          );
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 text-lg font-semibold">
          Failed to load teams. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="shadow-gold border-2 border-gold-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏆 Team Management
            </h1>
            <p className="text-gray-600">Manage all competing teams</p>
          </div>
          <Link to="/team/add_team">
            <Button size="lg" className="shadow-gold">
              <span className="mr-2">+</span>
              Add New Team
            </Button>
          </Link>
        </div>

        {teams && teams.length > 0 ? (
          <div className="bg-white rounded-lg border border-gold-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>Team Name</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>Actions</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <span className="font-semibold text-gold">
                        #{team.id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-gray-800">
                        {team.team_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-600 max-w-xs truncate">
                        {team.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link to={`/team/${team.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No teams yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first team to get started
            </p>
            <Link to="/team/add_team">
              <Button>Create First Team</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AllTeams;

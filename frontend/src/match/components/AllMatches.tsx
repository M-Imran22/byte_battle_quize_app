import { Link } from "react-router-dom";
import useAllMatches from "../hooks/useAllMatches";
import useDeleteMatch from "../hooks/useDeleteMatch";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

function AllMatches() {
  const { data: matches, isError, isLoading } = useAllMatches();
  const { mutate: deleteMatch } = useDeleteMatch();

  const handleDeleteMatch = (id: number) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      deleteMatch(id);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gold border-t-transparent"></div>
      </div>
    );
    
  if (isError)
    return (
      <div className="text-center mt-8">
        <div className="text-red-500 text-lg font-semibold">
          Error loading matches. Please try again later.
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="shadow-gold-lg border-2 border-gold-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🏆 Match Management
            </h1>
            <p className="text-gray-600">Manage all quiz matches and competitions</p>
          </div>
          <Link to="/match/add_match">
            <Button size="lg" className="shadow-gold">
              <span className="mr-2">+</span>
              Create New Match
            </Button>
          </Link>
        </div>

        {matches && matches.length > 0 ? (
          <div className="bg-white rounded-lg border border-gold-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gold-50 to-gold-100 text-gold-800 font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Match Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Match Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Teams & Scores</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches.map((match) => (
                  <tr key={match.id} className="hover:bg-gold-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-gold">#{match.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-semibold text-gray-800">{match.match_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {match.match_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        {match.rounds?.map((round) => (
                          <div key={round.teams.id} className="flex items-center justify-between bg-gray-50 px-3 py-1 rounded text-sm">
                            <span className="font-medium text-gray-700">{round.teams.team_name}</span>
                            <span className="font-bold text-gold">{round.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/match/${match.id}/scoreboard`}>
                          <Button size="sm" className="text-xs">
                            📊 Scoreboard
                          </Button>
                        </Link>
                        <Link to={`/match/${match.id}/quiz`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            🎮 Quiz
                          </Button>
                        </Link>
                        <Link to={`/match/${match.id}/edit`}>
                          <Button variant="secondary" size="sm" className="text-xs">
                            ✏️ Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDeleteMatch(match.id)}
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
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches yet</h3>
            <p className="text-gray-600 mb-6">Create your first match to get started</p>
            <Link to="/match/add_match">
              <Button>
                Create First Match
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AllMatches;
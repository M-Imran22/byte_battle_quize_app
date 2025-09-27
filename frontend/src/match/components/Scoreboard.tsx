import useSingleMatch from "../hooks/useSingleMatch";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useResetBuzzers from "../../buzzer/hooks/useResetBuzzers";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

function Scoreboard() {
  const { id } = useParams<{ id: string }>();
  const { data: match, isError, isLoading, mutation } = useSingleMatch(id);
  const [scores, setScores] = useState<{ [key: number]: number }>({});
  const resetBuzzers = useResetBuzzers();

  const handleResetBuzzers = () => {
    resetBuzzers.mutate(undefined, {
      onSuccess: () => {
        console.log("Buzzers reset successfully");
      },
      onError: (error: any) => {
        console.error("Failed to reset buzzers:", error.message);
      },
    });
  };

  // Initialize scores with current match rounds
  useEffect(() => {
    if (match) {
      const initialScores = match.rounds.reduce((acc, round) => {
        acc[round.id] = round.score;
        return acc;
      }, {} as { [key: number]: number });
      setScores(initialScores);
    }
  }, [match]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );

  if (isError)
    return (
      <div className="text-center mt-5">
        <p className="text-red-500">
          Failed to load match data. Please try again.
        </p>
      </div>
    );
  if (!match) return <div>No match data found.</div>;

  const handleScoreChange = (roundId: number, score: number) => {
    setScores((prev) => ({ ...prev, [roundId]: score }));
  };

  const handleSubmit = () => {
    const updatedRounds = match.rounds.map((round) => ({
      ...round,
      score: scores[round.id],
    }));
    mutation.mutate(updatedRounds);
    handleResetBuzzers();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="mb-6 text-gray-800 text-3xl font-bold">
        Scoreboard for {match?.match_type} – {match?.match_name}
      </h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Team</TableHeaderCell>
            <TableHeaderCell>Score</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {match.rounds.map((round) => (
            <TableRow key={round.id}>
              <TableCell>{round.teams.team_name}</TableCell>
              <TableCell>
                <input
                  type="number"
                  value={scores[round.id] ?? round.score}
                  onChange={(e) =>
                    handleScoreChange(round.id, parseInt(e.target.value) || 0)
                  }
                  className="input-field"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button
        onClick={handleSubmit}
        className="btn-primary mt-6"
      >
        Update Score
      </Button>
    </div>
  );
}

export default Scoreboard;
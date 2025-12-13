import useSingleMatch from "../match/hooks/useSingleMatch";
import { useParams } from "react-router-dom";
import useCurrentQuestion from "../match/hooks/useCurrentQuestion";
import useNextQuestion from "../match/hooks/useNextQuestion";
import useWinner from "../match/hooks/useWinner";
import useStartMatch from "../match/hooks/useStartMatch";
import { useState, useEffect } from "react";
import useAllBuzzers from "../buzzer/hooks/useAllBuzzers";
import byteBattleLogo from "../assets/logo.jpg";
import Button from "./ui/Button";
import { getSocket, createSocket } from "../services/socket";

function MainScreen() {
  const { id } = useParams();
  const { data: match, refetch: refetchMatch } = useSingleMatch(id);
  const { data: questionData, refetch: refetchQuestion } = useCurrentQuestion(
    id!
  );
  const { data: winnerData } = useWinner(
    id!,
    questionData?.isComplete || false
  );
  const { data: buzzers, refetch: refetchBuzzers } = useAllBuzzers();
  const startMatchMutation = useStartMatch();
  const nextQuestionMutation = useNextQuestion();
  const [correctOption, setCorrectOption] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);

  const [timer, setTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showWrongBg, setShowWrongBg] = useState(false);
  const [showCorrectBg, setShowCorrectBg] = useState(false);

  const currentQuestion = questionData?.question;
  const isMatchComplete = questionData?.isComplete;

  useEffect(() => {
    const socket = getSocket() || createSocket();
    if (!socket) return;

    let timerInterval: NodeJS.Timeout | null = null;

    // Listen for real-time buzzer presses
    socket.on("buzzer-pressed", () => {
      refetchBuzzers();
      // Start timer on first buzzer press
      if (!timerActive) {
        setTimer(30);
        setTimerActive(true);
      }
    });

    // Listen for buzzer resets
    socket.on("buzzers-reset", () => {
      refetchBuzzers();
      setTimer(null);
      setTimerActive(false);
    });

    // Listen for score updates
    socket.on("scores-updated", (data: any) => {
      if (data.matchId === id) {
        refetchMatch();
      }
    });

    // Listen for question updates
    socket.on("question-updated", (data: any) => {
      if (data.matchId === id) {
        refetchQuestion();
      }
    });

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      socket.off("buzzer-pressed");
      socket.off("buzzers-reset");
      socket.off("scores-updated");
      socket.off("question-updated");
    };
  }, [refetchBuzzers, refetchMatch, refetchQuestion, id, timerActive]);

  // Separate timer countdown effect
  useEffect(() => {
    if (!timerActive || timer === null) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timer]);

  const handleStartMatch = () => {
    if (match?.status === "pending") {
      startMatchMutation.mutate(id!, {
        onSuccess: () => {
          refetchQuestion();
        },
      });
    }
  };

  // Display confetti celebration effect for correct answers
  const displayCelebration = () => {
    // Play correct answer sound
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3"
    );
    audio.volume = 0.4;
    audio.play().catch((e) => console.log("Audio play failed:", e));

    // Show green background
    setShowCorrectBg(true);
    setTimeout(() => setShowCorrectBg(false), 2000);

    const confettiContainer = document.createElement("div");
    confettiContainer.id = "confetti-container";
    Object.assign(confettiContainer.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "1000",
      pointerEvents: "none",
    });
    document.body.appendChild(confettiContainer);

    const colors = [
      "#FFD700",
      "#FFA500",
      "#FF6347",
      "#00FF00",
      "#00CED1",
      "#FF1493",
    ];
    for (let i = 0; i < 500; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      const size = Math.random() * 15 + 10;
      Object.assign(confetti.style, {
        position: "absolute",
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 20}%`,
        borderRadius: Math.random() > 0.5 ? "50%" : "0",
        animation: `fall ${Math.random() * 3 + 2}s linear`,
        transform: `rotate(${Math.random() * 360}deg)`,
        opacity: Math.random() * 0.5 + 0.5,
      });
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  };

  // Button Handlers
  const handleNextQuestion = () => {
    setShowAnswer(false);
    setShowCorrectAnswer(false);
    setActiveOption(null);
    setShowWrongBg(false);
    setShowCorrectBg(false);

    nextQuestionMutation.mutate(id!, {
      onSuccess: (data) => {
        refetchQuestion();
        // Emit real-time question update
        const socket = getSocket() || createSocket();
        if (socket) {
          socket.emit("question-updated", { matchId: id });
        }
      },
    });
  };

  const handleCorrectOption = (selectedOption: string) => {
    setActiveOption(selectedOption);
    // Reset answer states when selecting new option
    setShowAnswer(false);
    setShowCorrectAnswer(false);

    if (selectedOption === currentQuestion?.correct_option) {
      setCorrectOption("correct");
      console.log("Congratulations!!!");
    } else {
      setCorrectOption("wrong");
      console.log("Wrong answer.");
    }
  };

  const playWrongSound = () => {
    const audio = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3"
    );
    audio.volume = 0.3;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  };

  const displayWrongEffect = () => {
    const screen = document.querySelector(".main-screen-container");
    if (screen) {
      screen.classList.add("shake-animation");
      setTimeout(() => screen.classList.remove("shake-animation"), 500);
    }
    setShowWrongBg(true);
    setTimeout(() => setShowWrongBg(false), 1500);
  };

  const handleCheckButton = () => {
    if (activeOption === null) return;

    // Stop timer when answer is checked
    setTimer(null);
    setTimerActive(false);

    if (correctOption === "correct") {
      setShowCorrectAnswer(true);
      displayCelebration();
    } else {
      setShowAnswer(true);
      playWrongSound();
      displayWrongEffect();
    }
  };

  return (
    <>
      {/* Global styles for confetti and shake animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .shake-animation {
          animation: shake 0.5s;
        }
      `}</style>
      <div
        className={`main-screen-container min-h-screen p-6 ${
          showCorrectBg
            ? "bg-green-500"
            : showWrongBg
            ? "bg-red-500"
            : timer !== null && timer <= 5 && timerActive
            ? "bg-red-500 animate-pulse"
            : "bg-gradient-to-br from-gold-50 via-white to-gold-100"
        } transition-all duration-500`}
      >
        <div className="flex justify-between gap-6 h-full">
          {/* Score Board */}
          <div className="bg-white p-6 rounded-xl shadow-gold-lg border-2 border-gold-200 sticky top-6 h-fit min-w-[280px]">
            <h1 className="text-3xl mb-6 text-gold font-bold text-center">
              🏆 Score Board
            </h1>
            <div className="flex flex-col gap-3">
              {match?.rounds
                .sort((a, b) => b.score - a.score)
                .map((round, index) => (
                  <div
                    key={round.id}
                    className="bg-white p-4 rounded-lg border border-gold-200 flex justify-between items-center shadow-sm hover:shadow-gold transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </span>
                      <span className="font-semibold text-xl text-gray-800">
                        {round.teams.team_name}
                      </span>
                    </div>
                    <span className="text-3xl font-bold text-gold">
                      {round.score}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Question Area */}
          <div className="flex-1 bg-white p-8 rounded-xl shadow-gold-lg border-2 border-gold-200">
            {/* Logo */}
            <div className="text-center mb-8">
              <img
                src={byteBattleLogo}
                alt="ByteBattle24 Logo"
                className="mx-auto h-36 rounded-lg shadow-gold border-2 border-gold-200"
              />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                {match?.match_name} - {match?.match_type}
              </h2>
            </div>

            {/* Winner Screen */}
            {isMatchComplete && winnerData ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏆</div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {winnerData.isTie ? "It's a Tie!" : "We Have a Winner!"}
                </h1>

                {winnerData.isTie ? (
                  <div className="space-y-2">
                    <p className="text-xl text-gray-600 mb-4">
                      Multiple teams tied for first place:
                    </p>
                    {winnerData.winners.map((winner: any, index: number) => (
                      <div key={index} className="text-2xl font-bold text-gold">
                        🥇 {winner.teams.team_name} - {winner.score} points
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold mb-2">
                      🥇 {winnerData.winner.teams.team_name}
                    </div>
                    <div className="text-xl text-gray-600">
                      Final Score: {winnerData.winner.score} points
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Final Scores
                  </h3>
                  <div className="space-y-2 max-w-md mx-auto">
                    {winnerData.finalScores
                      .sort((a: any, b: any) => b.score - a.score)
                      .map((team: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center bg-white p-3 rounded-lg shadow border border-gold-200"
                        >
                          <span className="font-medium">{team.team}</span>
                          <span className="font-bold text-gold">
                            {team.score} points
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="animate-bounce text-4xl my-6">🎉 🎊 🎉</div>
              </div>
            ) : currentQuestion ? (
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200 mb-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    📝 Question
                  </h3>
                  <p className="text-2xl text-gray-800 font-semibold leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["option_a", "option_b", "option_c", "option_d"].map(
                    (optionKey, index) => {
                      const optionValue = currentQuestion[
                        optionKey as keyof typeof currentQuestion
                      ] as string;
                      const isActive = activeOption === optionValue;
                      const isCorrect =
                        optionValue === currentQuestion?.correct_option;

                      let buttonClass = "bg-gold hover:bg-gold-600";
                      if (showCorrectAnswer && isCorrect) {
                        buttonClass = "bg-green-500 hover:bg-green-600";
                      } else if (showAnswer && isActive && !isCorrect) {
                        buttonClass = "bg-red-500 hover:bg-red-600";
                      } else if (isActive) {
                        buttonClass = "bg-blue-500 hover:bg-blue-600";
                      }

                      return (
                        <button
                          key={optionKey}
                          onClick={() => handleCorrectOption(optionValue)}
                          className={`${buttonClass} text-white text-lg h-20 rounded-lg font-bold transition-all duration-200 shadow-md border border-gold-300 flex items-center justify-center gap-3 p-4`}
                        >
                          <span className="font-bold text-gold w-10 h-10 bg-white rounded-md flex items-center justify-center text-xl">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 text-left">
                            {optionValue}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gold-50 p-8 rounded-lg border border-gold-200">
                  {match?.status === "pending" ? (
                    <div>
                      <p className="text-xl text-gray-700 font-medium mb-4">
                        🚀 Ready to start the quiz?
                      </p>
                      <p className="text-gray-600 mb-6">
                        This match has {match.question_count} questions ready to
                        go!
                      </p>
                      <Button
                        onClick={handleStartMatch}
                        disabled={startMatchMutation.isPending}
                        size="lg"
                        className="shadow-gold"
                      >
                        {startMatchMutation.isPending
                          ? "Starting..."
                          : "🎯 Start Match"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xl text-gray-700 font-medium">
                      🎯 Click "Next Question" to begin!
                    </p>
                  )}
                </div>
              </div>
            )}

            {!isMatchComplete && (
              <div className="flex justify-center gap-4 mt-8">
                {currentQuestion && (
                  <>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={nextQuestionMutation.isPending}
                      size="lg"
                      className="shadow-gold"
                    >
                      {nextQuestionMutation.isPending
                        ? "Processing..."
                        : "⏭️ Next Question"}
                    </Button>
                    <Button
                      onClick={handleCheckButton}
                      variant="secondary"
                      size="lg"
                    >
                      ✅ Check Answer
                    </Button>
                    {showAnswer && (
                      <Button
                        onClick={() => setShowCorrectAnswer(true)}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                        size="lg"
                      >
                        🎯 Reveal Answer
                      </Button>
                    )}
                  </>
                )}
                {!currentQuestion && match?.status === "active" && (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={nextQuestionMutation.isPending}
                    size="lg"
                    className="shadow-gold"
                  >
                    {nextQuestionMutation.isPending
                      ? "Loading..."
                      : "🎯 Start Quiz"}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Buzzers */}
          <div className="bg-white p-6 rounded-xl shadow-gold-lg border-2 border-gold-200 sticky top-6 h-fit min-w-[280px]">
            <h1 className="text-3xl mb-6 text-gold font-bold text-center">
              ⚡ Buzzers
            </h1>

            {/* Timer */}
            {timer !== null && (
              <div className="mb-6 text-center">
                <div
                  className={`inline-block px-6 py-3 rounded-lg font-bold text-3xl ${
                    timer <= 5 && timerActive
                      ? "bg-red-600 text-white border-2 border-red-800 animate-bounce"
                      : timer <= 10
                      ? "bg-red-100 text-red-700 border-2 border-red-300"
                      : "bg-blue-100 text-blue-700 border-2 border-blue-300"
                  }`}
                >
                  {timer <= 5 && timerActive ? "🚨" : "⏰"} {timer}s
                </div>
                {timer <= 5 && timerActive && (
                  <div className="mt-2 text-red-600 font-bold text-lg animate-pulse">
                    ⚠️ TIME RUNNING OUT!
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {buzzers?.length ? (
                buzzers.map((buzzer, index) => (
                  <div
                    key={buzzer.id}
                    className="bg-gold-50 p-4 rounded-lg border border-gold-200 shadow-sm hover:shadow-gold transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">🔥</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {buzzer.teamName}
                      </span>
                      <span className="ml-auto text-sm bg-gold text-white px-2 py-1 rounded-full font-medium">
                        #{index + 1}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ⏰{" "}
                      {new Date(buzzer.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-gold-50 p-6 rounded-lg border border-gold-200 text-center">
                  <p className="text-gray-600">🤫 No buzzers yet...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainScreen;

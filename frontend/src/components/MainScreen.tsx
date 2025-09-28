import useSingleMatch from "../match/hooks/useSingleMatch";
import { useParams } from "react-router-dom";
import useAllQuestoins, { Question } from "../questions/hooks/uesAllQustions";
import { useState, useEffect } from "react";
import useAllBuzzers from "../buzzer/hooks/useAllBuzzers";
import byteBattleLogo from "../assets/logo.jpg";
import Button from "./ui/Button";
import { getSocket, createSocket } from "../services/socket";

function MainScreen() {
  const { id } = useParams();
  const { data: match, refetch: refetchMatch } = useSingleMatch(id);
  const { data: questions } = useAllQuestoins();
  const { data: buzzers, refetch: refetchBuzzers } = useAllBuzzers();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [previousQuestion, setPreviousQuestion] = useState<number[]>([]);
  const [correctOption, setCorrectOption] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("white");
  const [timer, setTimer] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  let timeoutId: NodeJS.Timeout | null = null;
  let timerInterval: NodeJS.Timeout | null = null;

  useEffect(() => {
    const socket = getSocket() || createSocket();
    if (!socket) return;

    // Listen for real-time buzzer presses
    socket.on('buzzer-pressed', () => {
      refetchBuzzers();
      // Start timer on first buzzer press
      if (!timerActive) {
        setTimer(30);
        setTimerActive(true);
        
        timerInterval = setInterval(() => {
          setTimer((prev) => {
            if (prev === null || prev <= 1) {
              setTimerActive(false);
              if (timerInterval) clearInterval(timerInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    });

    // Listen for buzzer resets
    socket.on('buzzers-reset', () => {
      refetchBuzzers();
      // Reset timer
      setTimer(null);
      setTimerActive(false);
      if (timerInterval) clearInterval(timerInterval);
    });

    // Listen for score updates
    socket.on('scores-updated', (data: any) => {
      if (data.matchId === id) {
        refetchMatch(); // Refetch match data when scores update
      }
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (timerInterval) clearInterval(timerInterval);
      if (socket) {
        socket.off('buzzer-pressed');
        socket.off('buzzers-reset');
        socket.off('scores-updated');
      }
    };
  }, [refetchBuzzers, refetchMatch, id]);

  // Filter questions by match type (if applicable)
  const filteredQuestions = match?.match_type
    ? questions?.filter(
        (q) => q.q_type.toLowerCase() === match.match_type.toLowerCase()
      )
    : questions;

  // Utility to grab a random question
  const getRandomQuestion = () => {
    if (!filteredQuestions) return null;

    // Reset if we've asked all
    if (previousQuestion.length >= filteredQuestions.length) {
      setPreviousQuestion([]);
    }

    // Filter out previously used questions
    const availableQuestions = filteredQuestions.filter(
      (_, index) => !previousQuestion.includes(index)
    );

    // Random pick from the remaining
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const actualIndex = filteredQuestions.indexOf(
      availableQuestions[randomIndex]
    );

    setPreviousQuestion((prev) => [...prev, actualIndex]);
    return availableQuestions[randomIndex];
  };

  // Display confetti celebration effect for correct answers
  const displayCelebration = () => {
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

    for (let i = 0; i < 250; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      Object.assign(confetti.style, {
        position: "absolute",
        width: "20px",
        height: "20px",
        backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
        left: `${Math.random() * 100}%`,
        animation: `fall ${Math.random() * 2 + 3}s ease-in-out`,
        transform: `rotate(${Math.random() * 360}deg)`,
      });
      confettiContainer.appendChild(confetti);
    }

    setTimeout(() => {
      confettiContainer.remove();
    }, 4000); // Remove confetti after 4 seconds
  };

  // Button Handlers
  const handleNextQuestion = () => {
    setBackgroundColor("white");
    setShowAnswer(false);
    setShowCorrectAnswer(false);
    setActiveOption(null);
    const nextQuestion = getRandomQuestion();
    setCurrentQuestion(nextQuestion || null);
  };

  const handleCorrectOption = (selectedOption: string) => {
    setActiveOption(selectedOption);
    if (selectedOption === currentQuestion?.correct_option) {
      setCorrectOption("correct");
      console.log("Congratulations!!!");
    } else {
      setCorrectOption("wrong");
      console.log("Wrong answer.");
    }
  };

  const handleCheckButton = () => {
    if (activeOption === null) return;
    
    // Stop timer when answer is checked
    setTimer(null);
    setTimerActive(false);
    if (timerInterval) clearInterval(timerInterval);
    
    if (correctOption === "correct") {
      setShowCorrectAnswer(true);
      displayCelebration();
      setBackgroundColor("white");
    } else {
      setShowAnswer(true);
      // Keep white background, show wrong answer styling on question area
    }
  };

  return (
    <>
      {/* Global styles for confetti animation */}
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
      `}</style>
      <div
        className={`min-h-screen p-6 ${timer !== null && timer <= 5 && timerActive ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-br from-gold-50 via-white to-gold-100'} transition-all duration-500`}
        style={{ backgroundColor: backgroundColor !== 'white' ? backgroundColor : undefined }}
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
                    <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
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
                className="mx-auto h-32 rounded-lg shadow-gold border-2 border-gold-200"
              />
              <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Quiz Championship
              </h2>
            </div>

            {currentQuestion ? (
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-2 border-blue-200 mb-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">📝 Question</h3>
                  <p className="text-2xl text-gray-800 font-semibold leading-relaxed">
                    {currentQuestion.question}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["option_a", "option_b", "option_c", "option_d"].map(
                    (optionKey, index) => {
                      const optionValue = currentQuestion
                        ? currentQuestion[optionKey as keyof Question]
                        : "";
                      const isActive = activeOption === optionValue;
                      const isCorrect =
                        optionValue === currentQuestion?.correct_option;

                      let buttonClass = "bg-gold hover:bg-gold-600";
                      if (showCorrectAnswer && isCorrect) {
                        buttonClass = "bg-green-500 hover:bg-green-600";
                      } else if (showAnswer && correctOption === 'wrong' && isActive) {
                        buttonClass = "bg-red-500 hover:bg-red-600";
                      } else if (isActive) {
                        buttonClass = "bg-blue-500 hover:bg-blue-600";
                      }

                      return (
                        <button
                          key={optionKey}
                          onClick={() =>
                            handleCorrectOption(optionValue as string)
                          }
                          className={`${buttonClass} text-white text-lg h-20 rounded-lg font-bold transition-all duration-200 shadow-md border border-gold-300 flex items-center justify-center gap-3 p-4`}
                        >
                          <span className="font-bold text-gold w-10 h-10 bg-white rounded-md flex items-center justify-center text-xl">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 text-left">{optionValue}</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-gold-50 p-8 rounded-lg border border-gold-200">
                  <p className="text-xl text-gray-700 font-medium">
                    {filteredQuestions?.length
                      ? "🚀 Ready to start the quiz?"
                      : "❌ No questions available"}
                  </p>
                </div>
              </div>
            )}

            {filteredQuestions?.length && (
              <div className="mt-6 text-center">
                <div className="bg-gold-50 p-3 rounded-lg border border-gold-200 inline-block">
                  <p className="text-gray-700 font-medium">
                    📊 Questions remaining:{" "}
                    <span className="font-bold text-gold text-lg">
                      {filteredQuestions.length - previousQuestion.length}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mt-8">
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="shadow-gold"
              >
                ⏭️ Next Question
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
            </div>
          </div>

          {/* Buzzers */}
          <div className="bg-white p-6 rounded-xl shadow-gold-lg border-2 border-gold-200 sticky top-6 h-fit min-w-[280px]">
            <h1 className="text-3xl mb-6 text-gold font-bold text-center">
              ⚡ Buzzers
            </h1>
            
            {/* Timer */}
            {timer !== null && (
              <div className="mb-6 text-center">
                <div className={`inline-block px-6 py-3 rounded-lg font-bold text-3xl ${timer <= 5 && timerActive ? 'bg-red-600 text-white border-2 border-red-800 animate-bounce' : timer <= 10 ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-blue-100 text-blue-700 border-2 border-blue-300'}`}>
                  {timer <= 5 && timerActive ? '🚨' : '⏰'} {timer}s
                </div>
                {timer <= 5 && timerActive && (
                  <div className="mt-2 text-red-600 font-bold text-lg animate-pulse">
                    ⚠️ TIME RUNNING OUT!
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
              {buzzers?.length ? buzzers.map((buzzer, index) => (
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
                    ⏰ {new Date(buzzer.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
              )) : (
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
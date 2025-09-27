import useSingleMatch from "../match/hooks/useSingleMatch";
import { useParams } from "react-router-dom";
import useAllQuestoins, { Question } from "../questions/hooks/uesAllQustions";
import { useState, useEffect } from "react";
import useAllBuzzers from "../buzzer/hooks/useAllBuzzers";
import byteBattleLogo from "../assets/logo.jpg";
import Button from "./ui/Button";

function MainScreen() {
  const { id } = useParams();
  const { data: match } = useSingleMatch(id);
  const { data: questions } = useAllQuestoins();
  const { data: buzzers } = useAllBuzzers();
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [previousQuestion, setPreviousQuestion] = useState<number[]>([]);
  const [correctOption, setCorrectOption] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [activeOption, setActiveOption] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("white");
  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId); // Cleanup timeout on unmount
    };
  }, []);

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
    if (correctOption === "correct") {
      setShowCorrectAnswer(true);
      displayCelebration();
      setBackgroundColor("white");
    } else {
      setShowAnswer(true);
      setBackgroundColor("red");
      timeoutId = setTimeout(() => {
        setBackgroundColor("white");
      }, 4000);
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
        className={`min-h-screen p-4 flex justify-between flex-wrap md:flex-nowrap`}
        style={{ backgroundColor }}
      >
        {/* Score Board */}
        <div className="bg-white p-6 rounded-xl shadow-md max-w-auto sticky top-4 h-fit">
          <h1 className="text-5xl mb-6 text-red-600 font-bold text-center">
            Score Board
          </h1>
          <div className="flex flex-col gap-3">
            {match?.rounds.map((round) => (
              <div
                key={round.id}
                className="bg-white p-3 rounded-md border-l-4 border-red-600 flex justify-between items-center shadow-sm"
              >
                <span className="font-semibold text-xl text-blue-600">
                  {round.teams.team_name}
                </span>
                <span className="ml-7 text-3xl font-bold text-gray-800">
                  {round.score}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 max-w-auto bg-white p-6 mb-12 rounded-xl shadow-md mx-0 md:mx-6 mt-6 md:mt-0 border-4 border-gold-500">
          {/* Optional ByteBattle24 Logo at the top */}
          <div className="text-center">
            <img
              src={byteBattleLogo}
              alt="ByteBattle24 Logo"
              className="mx-auto mb-4 h-48"
            />
          </div>

          {currentQuestion ? (
            <div className="mt-4 text-center">
              <h2 className="text-xl mb-6 text-black font-semibold border-2 border-black rounded-md p-4">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["option_a", "option_b", "option_c", "option_d"].map(
                  (optionKey, index) => {
                    const optionValue = currentQuestion
                      ? currentQuestion[optionKey as keyof Question]
                      : "";
                    const isActive = activeOption === optionValue;
                    const isCorrect =
                      optionValue === currentQuestion?.correct_option;

                    // When correct answer is revealed, the selected button turns green
                    let background = "#C9A834";
                    if (showCorrectAnswer && isCorrect) {
                      background = "#10B981";
                    } else if (isActive) {
                      background = "#3B82F6";
                    }

                    return (
                      <button
                        key={optionKey}
                        onClick={() =>
                          handleCorrectOption(optionValue as string)
                        }
                        className={`text-white text-lg h-20 rounded-md font-bold hover:bg-gold-400 transition-colors flex flex-col items-center justify-center gap-1 p-2`}
                        style={{ backgroundColor: background }}
                      >
                        <span className="font-bold text-blue-600 w-10 h-10 bg-white rounded-md flex items-center justify-center text-xl">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-sm">{optionValue}</span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xl text-gray-500 text-center">
              {filteredQuestions?.length
                ? "Click next to start!"
                : "No questions available"}
            </p>
          )}

          {filteredQuestions?.length && (
            <p className="mt-4 text-md text-gray-500 text-center">
              Questions remaining:{" "}
              <span className="font-bold text-blue-600">
                {filteredQuestions.length - previousQuestion.length}
              </span>
            </p>
          )}

          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handleNextQuestion}
              className="bg-blue-700 text-white px-6 font-bold hover:bg-blue-600"
            >
              Next Question
            </Button>
            <Button
              onClick={handleCheckButton}
              className="bg-blue-700 text-white px-6 font-bold hover:bg-blue-600"
            >
              Check Answer
            </Button>
            {showAnswer && (
              <Button
                onClick={() => setShowCorrectAnswer(true)}
                className="bg-green-600 text-white px-6 font-bold hover:bg-green-500"
              >
                Reveal Answer
              </Button>
            )}
          </div>
        </div>

        {/* Buzzers */}
        <div className="bg-white p-6 rounded-xl shadow-md max-w-auto sticky top-4 h-fit">
          <h1 className="text-5xl mb-4 text-red-600 font-bold">
            Buzzers
          </h1>
          <div className="flex flex-col gap-3">
            {buzzers?.map((buzzer) => (
              <div
                key={buzzer.id}
                className="bg-gray-50 p-3 rounded-md flex flex-col border-l-4 border-red-600 shadow-sm"
              >
                <span className="text-xl font-semibold text-blue-600">
                  {buzzer.teamName}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(buzzer.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default MainScreen;
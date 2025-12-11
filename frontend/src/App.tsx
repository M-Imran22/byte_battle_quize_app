import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Home from "./components/Home";
import RegisterUser from "./auth/RegisterUser";
import Login from "./auth/Login";
import LayOut from "./Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AddMatch from "./match/components/AddMatch";

import ExcelQuestionImporter from "./questions/components/ExcelQuestionImporter";
import Timer from "./components/Timer";
import AddTeam from "./teams/components/AddTeam";
import AllTeams from "./teams/components/AllTeams";
import EditTeam from "./teams/components/EditTeam";
import AllQuestions from "./questions/components/AllQuestions";
import EditQuestion from "./questions/components/EditQuestion";
import AllMatches from "./match/components/AllMatches";
import Scoreboard from "./match/components/Scoreboard";
import EditMatch from "./match/components/EditMatch";
import MainScreen from "./components/MainScreen";
import BuzzerPage from "./buzzer/comopnents/buzzerScreen";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/login" element={<Login />} />
        <Route path="/buzzer/buzzer_screen" element={<BuzzerPage />} />
        <Route path="/match/:id/quiz" element={<MainScreen />} />
        <Route element={<ProtectedRoute><LayOut /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/team">
            <Route path="add_team" element={<AddTeam />} />
            <Route path="all_teams" element={<AllTeams />} />
            <Route path=":id/edit" element={<EditTeam />} />
          </Route>
          <Route path="/question">

            <Route path="excel_import" element={<ExcelQuestionImporter />} />
            <Route path="all_questions" element={<AllQuestions />} />
            <Route path=":id/edit" element={<EditQuestion />} />
          </Route>
          <Route path="/match">
            <Route path="add_match" element={<AddMatch />} />
            <Route path="all_matches" element={<AllMatches />} />
            <Route path=":id/edit" element={<EditMatch />} />
            <Route path=":id/scoreboard" element={<Scoreboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

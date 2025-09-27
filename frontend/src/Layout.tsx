import { Outlet } from "react-router-dom";
import Nevbar from "./components/Nevbar";

function LayOut() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Nevbar />
      <div className="container mx-auto px-8 py-8 mt-20">
        <Outlet />
      </div>
    </div>
  );
}

export default LayOut;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Medications from "./pages/Medications";
import Reminders from "./pages/Reminders";
import RefillTracker from "./pages/RefillTracker";
import Reports from "./pages/Reports";
import MedicationHistory from "./pages/MedicationHistory";
import Profile from "./pages/Profile";
import ChatWidget from "./pages/ChatWidget";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Medications />} />

          <Route path="medications" element={<Medications />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="refill-tracker" element={<RefillTracker />} />
          <Route path="reports" element={<Reports />} />
          <Route path="history" element={<MedicationHistory />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
      <ChatWidget />
    </>

  );
}

export default App;

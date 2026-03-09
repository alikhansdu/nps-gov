import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import AdminOverview from "./pages/AdminOverview";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminCreateSurvey from "./pages/AdminCreateSurvey";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/surveys" element={<Surveys />} />
      <Route path="/surveys/:id" element={<SurveyDetail />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/login" element={<Login />} />
      {/* Admin */}
      <Route path="/admin" element={<AdminOverview />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/create" element={<AdminCreateSurvey />} />
    </Routes>
  );
}

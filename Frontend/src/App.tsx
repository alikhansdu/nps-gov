import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import AnalyticsFixed from "./pages/AnalyticsFixed";
import Login from "./pages/Login";
import AdminOverview from "./pages/AdminOverview";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminCreateSurvey from "./pages/AdminCreateSurvey";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/surveys" element={<Surveys />} />
      <Route path="/surveys/:id" element={<SurveyDetail />} />
      <Route path="/analytics" element={<AnalyticsFixed />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminOverview />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/reports" element={<AdminReports />} />
      <Route path="/admin/create" element={<AdminCreateSurvey />} />

      {/* Admin Page */}  
      <Route path="/admin/users" element={<AdminPage />} />  {/* ← сюда */}
    </Routes>
  );
}
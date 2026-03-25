import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Surveys from "./pages/Surveys";
import SurveyDetail from "./pages/SurveyDetail";
import Analytics from "./pages/Analytics";
import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import AdminOverview from "./pages/AdminOverview";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminReports from "./pages/AdminReports";
import AdminCreateSurvey from "./pages/AdminCreateSurvey";
import AdminEditSurvey from "./pages/AdminEditSurvey";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/surveys" element={<Surveys />} />
      <Route path="/surveys/:id" element={<SurveyDetail />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      {/* Admin */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/create" element={<AdminCreateSurvey />} />
        <Route path="/admin/surveys/:id/edit" element={<AdminEditSurvey />} />
      </Route>
    </Routes>
  );
}

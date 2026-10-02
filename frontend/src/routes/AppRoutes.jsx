import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

import Home from "../pages/public/Home.jsx";
import About from "../pages/public/About.jsx";
import Organization from "../pages/public/Organization.jsx";
import Courses from "../pages/public/Courses.jsx";
import Students from "../pages/public/Students.jsx";
import EntranceList from "../pages/public/EntranceList.jsx";
import FacultyStaff from "../pages/public/FacultyStaff.jsx";
import Collaboration from "../pages/public/Collaboration.jsx";
import News from "../pages/public/News.jsx";
import Programs from "../pages/public/Programs.jsx";
import Contact from "../pages/public/Contact.jsx";
import NotFound from "../pages/public/NotFound.jsx";

import Welcome from "../pages/auth/Welcome.jsx";
import Referral from "../pages/auth/Referral.jsx";
import Register from "../pages/auth/Register.jsx";
import VerifyOtp from "../pages/auth/VerifyOtp.jsx";
import Login from "../pages/auth/Login.jsx";
import Verify2FA from "../pages/auth/Verify2FA.jsx";
import Dashboard from "../pages/auth/Dashboard.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import VerifyResetOtp from "../pages/auth/VerifyResetOtp.jsx";
import ResetPassword from "../pages/auth/ResetPassword.jsx";
import Sessions from "../pages/auth/Sessions.jsx";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import GuestRoute from "../components/auth/GuestRoute.jsx";
import AuthSessionManager from "../components/auth/AuthSessionManager.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthSessionManager />

      <Routes>
        {/* ================= PUBLIC WEBSITE ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/organization" element={<Organization />} />
          <Route path="/academic/courses" element={<Courses />} />
          <Route path="/academic/students" element={<Students />} />
          <Route path="/academic/entrance-list" element={<EntranceList />} />
          <Route path="/faculties-staff" element={<FacultyStaff />} />
          <Route path="/collaboration" element={<Collaboration />} />
          <Route path="/news" element={<News />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ================= AUTH / PORTAL ================= */}
        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="/acc/auth" element={<Welcome />} />
            <Route path="/acc/auth/referral" element={<Referral />} />
            <Route path="/acc/auth/register" element={<Register />} />
            <Route path="/acc/auth/verify-otp" element={<VerifyOtp />} />
            <Route path="/acc/auth/login" element={<Login />} />
            <Route path="/acc/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/acc/auth/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/acc/auth/reset-password" element={<ResetPassword />} />
          </Route>

          <Route path="/acc/auth/verify-2fa" element={<Verify2FA />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/acc/auth/dashboard" element={<Dashboard />} />
            <Route path="/acc/auth/sessions" element={<Sessions />} />
          </Route>
        </Route>

        {/* ================= LEGACY AUTH URLS ================= */}
        <Route path="/login" element={<Navigate to="/acc/auth/login" replace />} />
        <Route path="/register" element={<Navigate to="/acc/auth/register" replace />} />
        <Route path="/referral" element={<Navigate to="/acc/auth/referral" replace />} />
        <Route path="/verify-otp" element={<Navigate to="/acc/auth/verify-otp" replace />} />
        <Route path="/verify-2fa" element={<Navigate to="/acc/auth/verify-2fa" replace />} />
        <Route path="/forgot-password" element={<Navigate to="/acc/auth/forgot-password" replace />} />
        <Route path="/verify-reset-otp" element={<Navigate to="/acc/auth/verify-reset-otp" replace />} />
        <Route path="/reset-password" element={<Navigate to="/acc/auth/reset-password" replace />} />
        <Route path="/dashboard" element={<Navigate to="/acc/auth/dashboard" replace />} />
        <Route path="/sessions" element={<Navigate to="/acc/auth/sessions" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

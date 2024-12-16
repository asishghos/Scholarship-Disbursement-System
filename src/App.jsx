import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import Home from "./components/Home";
import UploadDocs from "./pages/UploadDocs";
import Layout from "./components/Layout";
import Track from "./components/Track";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import AdminSignup from "./pages/AdminSignup";
import AddScholarshipForm from "./components/AdminSide/AddScholarshipForm";
import ScholarshipList from "./components/ScholarshipList";
import StudentTrack from "./components/StudentTrack";
import ScholarshipApplication from "./components/StudentSite/ScholarshipApplication";
import EditScholarship from "./components/EditScholarship";
import DocsTrack from "./components/AdminSide/DocsTrack";
import DocsVerification from "./components/AdminSide/DocsVerification";
import DocDetails from "./components/DocsDetails";
import ApplicationsCheck from "./components/AdminSide/ApplicationsCheck";
import UpdatedDashboard from "./components/StudentSite/UpdatedDashboard";
import EKYC from "./components/EKYC";
import FAQ from "./pages/FAQ";
import DocumentDownload from "./components/DocsDownload";
import AdminPanel from "./components/AdminSide/AdminPanel";
import SAGHomePage from "./components/SAG/SAGHomePage";
import Home_ from "./pages/Home_";
import Registration_ from "./pages/Registration_";
import "./App.css";
import AboutPage from "./pages/Home_About";
import ProtectedRoute from "./pages/ProtectedRoutes";
import ForbiddenPage from "./pages/forbidden";
import Contactd from "./pages/contactd";

const App = () => {
  return (
    <>
      <Analytics />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home_ />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/admin" element={<AdminSignup />} />
          <Route path="/registration" element={<Registration_ />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route
            path="/sag-home-page"
            element={
              <ProtectedRoute element={<SAGHomePage />} role="SAG" />
            }
          />
          <Route
            path="*"
            element={
              <Layout>
                <Routes>
                  <Route path="/contactd" element={<Contactd />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route
                    path="/viewScholarships"
                    element={
                      <ProtectedRoute element={<StudentTrack />} role="student" />
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={<ProtectedRoute element={<Dashboard />} role="student" />}
                  />
                  <Route
                    path="/home"
                    element={<ProtectedRoute element={<Home />} role="student" />}
                  />
                  <Route
                    path="/faq"
                    element={<ProtectedRoute element={<FAQ />} role="student" />}
                  />
                  <Route
                    path="/upload"
                    element={<ProtectedRoute element={<UploadDocs />} role="student" />}
                  />
                  <Route
                    path="/track"
                    element={<ProtectedRoute element={<Track />} role="student" />}
                  />
                  <Route
                    path="/apply"
                    element={
                      <ProtectedRoute element={<ScholarshipApplication />} role="student" />
                    }
                  />
                  <Route
                    path="/updatedDashboard"
                    element={
                      <ProtectedRoute element={<UpdatedDashboard />} role="student" />
                    }
                  />
                  <Route
                    path="/details/:id"
                    element={<ProtectedRoute element={<DocDetails />} role="admin" />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/ekyc0"
                    element={<ProtectedRoute element={<EKYC />} role="student" />}
                  />
                  <Route
                    path="/ekyc1"
                    element={<ProtectedRoute element={<AdminPanel />} role="admin" />}
                  />
                  <Route
                    path="/docs-track"
                    element={<ProtectedRoute element={<DocsTrack />} role="student" />}
                  />
                  <Route
                    path="/docs-verification"
                    element={
                      <ProtectedRoute element={<DocsVerification />} role="admin" />
                    }
                  />
                  <Route
                    path="/download-documents"
                    element={
                      <ProtectedRoute element={<DocumentDownload />} role="student" />
                    }
                  />
                  <Route
                    path="/applications-check"
                    element={
                      <ProtectedRoute element={<ApplicationsCheck />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute element={<AddScholarshipForm />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-track"
                    element={<ProtectedRoute element={<ScholarshipList />} role="admin" />}
                  />
                  <Route
                    path="/admin-scholarship-list"
                    element={
                      <ProtectedRoute element={<ScholarshipList />} role="admin" />
                    }
                  />
                  <Route
                    path="/admin-add-scholarship"
                    element={
                      <ProtectedRoute element={<AddScholarshipForm />} role="admin" />
                    }
                  />
                  <Route
                    path="/editScholarship"
                    element={<ProtectedRoute element={<EditScholarship />} role="admin" />}
                  />
                </Routes>
              </Layout>
            }
          />
        </Routes>
        <ToastContainer />
      </Router>
    </>
  );
};

export default App;

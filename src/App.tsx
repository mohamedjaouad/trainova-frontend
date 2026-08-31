import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Auth from "./components/auth/Auth"
import { AiCoach } from "./components/aiCoach"
import Profile from "./components/profile/Profile"
import OnboardingProfile from "./components/profile/OnboardingProfile"
import ProgramDetail from "./components/programDetail/ProgramDetail"
import WorkoutLog from "./components/workoutLog/WorkoutLog"
import WorkoutDetail from "./components/workoutLog/WorkoutDetail"
import ActiveWorkout from "./components/workoutLog/ActiveWorkout"
import ActiveWorkoutBadge from "./components/workoutLog/ActiveWorkoutBadge"
import Dashboard from "./components/dashboard/Dashboard"
import Layout from "./components/common/Layout/Layout"
import ProtectedRoute from "./components/common/ProtectedRoute"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "./Styles/global.css"
import Admin from "./components/admin/Admin"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/onboarding"
          element={
            <ProtectedRoute>
              <Layout>
                <OnboardingProfile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-coach"
          element={
            <ProtectedRoute>
              <Layout>
                <AiCoach />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/program-detail"
          element={
            <ProtectedRoute>
              <Layout>
                <ProgramDetail />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workout-log"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkoutLog />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workout/start"
          element={
            <ProtectedRoute>
              <Layout>
                <ActiveWorkout />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/workout/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <WorkoutDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Layout>
                <Admin />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
      <ActiveWorkoutBadge />
    </Router>
  )
}

export default App

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import api from "./api/axiosConfig";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";

function App() {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    return token && role ? { username, role } : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    // optional: validate token or refresh user info
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <h3>STUDENT REPORT SYSTEM</h3>

        {user ? (
          <>
            <p>{user.username} ({user.role})</p>

            {user.role === "teacher" && (
              <>
                <Link to="/teacher">Teacher Dashboard</Link>
              </>
            )}

            {user.role === "student" && (
              <Link to="/student">My Dashboard</Link>
            )}

            {user.role === "parent" && (
              <Link to="/parent">Parent Dashboard</Link>
            )}

            <button className="btn-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setUser={setUser} />} />

          <Route path="/teacher" element={
            user && user.role === "teacher" ? <TeacherDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/student" element={
            user && user.role === "student" ? <StudentDashboard /> : <Navigate to="/login" />
          } />

          <Route path="/parent" element={
            user && user.role === "parent" ? <ParentDashboard /> : <Navigate to="/login" />
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

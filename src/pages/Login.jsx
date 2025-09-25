import React, { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      const token = res.data.token;
      const role = (res.data.role || "").toLowerCase();

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", res.data.username || username);

      setUser({ username: res.data.username || username, role });
      // redirect based on role
      if (role === "teacher") nav("/teacher");
      else if (role === "student") nav("/student");
      else if (role === "parent") nav("/parent");
      else nav("/");
    } catch (e) {
      console.error(e);
      setErr("Login failed: invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" required/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required/>
        <button className="btn-primary" type="submit">Login</button>
      </form>
      {err && <p className="error">{err}</p>}
    </div>
  );
}

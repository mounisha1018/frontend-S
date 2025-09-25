import React, { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Signup(){
  const [form, setForm] = useState({ username:"", password:"", role:"TEACHER" });
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { username: form.username, password: form.password, role: form.role };
      await api.post("/auth/register", payload);
      alert("Registered — please login.");
      nav("/login");
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.message || "Register failed");
    }
  };

  return (
    <div className="login-container">
      <h2>Signup</h2>
      <form onSubmit={submit}>
        <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
        <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="PARENT">Parent</option>
        </select>
        <button className="btn-primary" type="submit">Signup</button>
      </form>
      {err && <p className="error">{err}</p>}
    </div>
  );
}

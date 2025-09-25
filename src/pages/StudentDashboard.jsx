import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const s = await api.get("/students/my"); setStudents(s.data);
      const r = await api.get("/reports/my"); setReports(r.data);
      const a = await api.get("/attendance/my"); setAttendance(a.data);
      const avg = await api.get("/analytics/average-grade/me");
      const att = await api.get("/analytics/attendance-percent/me");
      setStatus({ average: avg.data?.averageGrade, attendance: att.data?.attendancePercent });
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <h2>My Dashboard (Student)</h2>

      <section>
        <h3>My Info</h3>
        <ul>{students.map(s => (<li key={s.id}>{s.name} — {s.rollNo} — {s.className}</li>))}</ul>
      </section>

      <section>
        <h3>My Reports</h3>
        <ul>{reports.map(r => (<li key={r.id}>{r.term} — Grades: {JSON.stringify(r.gradesJson)} — {r.remarks}</li>))}</ul>
      </section>

      <section>
        <h3>My Attendance</h3>
        <ul>{attendance.map(a => (<li key={a.id}>{a.date} — {a.status}</li>))}</ul>
      </section>

      {status && (
        <section>
          <h3>Status</h3>
          <p>Average Grade: {status.average?.toFixed(2)}</p>
          <p>Attendance: {status.attendance?.toFixed(2)}%</p>
        </section>
      )}
    </div>
  );
}

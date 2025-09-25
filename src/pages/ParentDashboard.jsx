import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";

export default function ParentDashboard() {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [status, setStatus] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const s = await api.get("/students/my"); setStudents(s.data);
      const r = await api.get("/reports/my"); setReports(r.data);
      const a = await api.get("/attendance/my"); setAttendance(a.data);

      // fetch status per child
      const newStatus = {};
      for (const child of s.data) {
        try {
          const avg = await api.get(`/analytics/average-grade/${child.id}`);
          const att = await api.get(`/analytics/attendance-percent/${child.id}`);
          newStatus[child.id] = {
            average: avg.data?.averageGrade,
            attendance: att.data?.attendancePercent,
          };
        } catch {}
      }
      setStatus(newStatus);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <h2>Parent Dashboard</h2>

      <section>
        <h3>Children</h3>
        <ul>{students.map(s => (<li key={s.id}>{s.name} — {s.rollNo} — {s.className}</li>))}</ul>
      </section>

      <section>
        <h3>Reports for Children</h3>
        <ul>{reports.map(r => (<li key={r.id}>{r.student?.name} — {r.term} — {JSON.stringify(r.gradesJson)}</li>))}</ul>
      </section>

      <section>
        <h3>Attendance for Children</h3>
        <ul>{attendance.map(a => (<li key={a.id}>{a.student?.name} — {a.date} — {a.status}</li>))}</ul>
      </section>

      <section>
        <h3>Status</h3>
        <ul>
          {students.map(s => (
            <li key={s.id}>
              {s.name} — Average: {status[s.id]?.average?.toFixed(2) || "-"} | Attendance: {status[s.id]?.attendance?.toFixed(2) || "-"}%
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

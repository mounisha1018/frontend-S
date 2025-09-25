import React, { useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TeacherDashboard() {
  // --- Students ---
  const [students, setStudents] = useState([]);
  const [studentForm, setStudentForm] = useState({ name: "", rollNo: "", className: "", parentId: "" });
  const [editingStudentId, setEditingStudentId] = useState(null);

  // --- Attendance ---
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [localAtt, setLocalAtt] = useState({});

  // --- Reports ---
  const [reports, setReports] = useState([]);
  const [reportForm, setReportForm] = useState({ id: null, studentId: "", term: "", gradesJson: '{"Math":85}', remarks: "" });

  // --- Analytics ---
  const [selectedStudent, setSelectedStudent] = useState("");
  const [avg, setAvg] = useState(null);
  const [attPct, setAttPct] = useState(null);
  const [chartData, setChartData] = useState([]);

  // --- Navigation ---
  const [activeTab, setActiveTab] = useState("students");

  // --- Load Data ---
  const loadStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (e) { console.error(e); }
  };

  const loadReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (e) { console.error(e); }
  };

  const loadAttendance = async () => {
    try {
      const res = await api.get(`/attendance?date=${date}`);
      const map = {};
      res.data.forEach(a => { map[a.studentId] = a.status; });
      setLocalAtt(map);
    } catch (e) { console.error(e); }
  };

  // --- Polling for real-time students list ---
  useEffect(() => {
    loadStudents();
    loadReports();
    loadAttendance();
    const interval = setInterval(loadStudents, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  // --- Student CRUD ---
  const addOrUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      const payload = { name: studentForm.name, rollNo: studentForm.rollNo, className: studentForm.className };
      if (studentForm.parentId) payload.parentId = studentForm.parentId;
      if (editingStudentId) await api.put(`/students/${editingStudentId}`, payload);
      else await api.post("/students", payload);
      setStudentForm({ name: "", rollNo: "", className: "", parentId: "" });
      setEditingStudentId(null);
      loadStudents();
    } catch (e) { alert("Save student failed"); console.error(e); }
  };

  const startEditStudent = (s) => {
    setStudentForm({ name: s.name, rollNo: s.rollNo, className: s.className, parentId: s.parentId || "" });
    setEditingStudentId(s.id);
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Delete student?")) return;
    await api.delete(`/students/${id}`);
    loadStudents();
    loadReports();
    loadAttendance();
  };

  // --- Attendance ---
  const markAttendance = async (studentId, status) => {
    try {
      await api.post("/attendance", { studentId, date, status });
      setLocalAtt(prev => ({ ...prev, [studentId]: status }));
    } catch (e) { console.error(e); alert("Failed to mark attendance"); }
  };

  // --- Reports CRUD ---
  const addOrUpdateReport = async (e) => {
    e.preventDefault();
    try {
      const grades = JSON.parse(reportForm.gradesJson);
      if (reportForm.id)
        await api.put(`/reports/${reportForm.id}`, { studentId: Number(reportForm.studentId), term: reportForm.term, gradesJson: grades, remarks: reportForm.remarks });
      else
        await api.post("/reports", { studentId: Number(reportForm.studentId), term: reportForm.term, gradesJson: grades, remarks: reportForm.remarks });
      setReportForm({ id: null, studentId: "", term: "", gradesJson: '{"Math":85}', remarks: "" });
      loadReports();
    } catch (e) { alert("Add/Update report failed."); console.error(e); }
  };

  const startEditReport = (r) => {
    setReportForm({ id: r.id, studentId: r.studentId, term: r.term, gradesJson: JSON.stringify(r.gradesJson), remarks: r.remarks });
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete report?")) return;
    await api.delete(`/reports/${id}`);
    loadReports();
  };

  // --- Analytics ---
  const fetchAnalytics = async (sid) => {
    try {
      setSelectedStudent(sid);
      const avgRes = await api.get(`/analytics/average-grade/${sid}`);
      const attRes = await api.get(`/analytics/attendance-percent/${sid}`);
      setAvg(avgRes.data);
      setAttPct(attRes.data);

      const rep = await api.get(`/reports/student/${sid}`);
      setChartData((rep.data || []).map((r, idx) => {
        const vals = r.gradesJson ? Object.values(r.gradesJson) : [];
        const gavg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        return { name: `R${idx + 1}`, avg: Math.round(gavg * 100) / 100 };
      }));
    } catch (e) { console.error(e); }
  };

  // --- Render ---
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 200, borderRight: "1px solid #ccc", padding: 10 }}>
        <h3>Menu</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><button onClick={() => setActiveTab("students")}>Students</button></li>
          <li><button onClick={() => setActiveTab("attendance")}>Mark Attendance</button></li>
          <li><button onClick={() => setActiveTab("reports")}>Reports</button></li>
          <li><button onClick={() => setActiveTab("analytics")}>Analytics</button></li>
        </ul>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>

        {/* Students */}
        {activeTab === "students" && (
          <div>
            <h2>Students</h2>
            <form onSubmit={addOrUpdateStudent} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <input placeholder="Name" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} required />
              <input placeholder="Roll No" value={studentForm.rollNo} onChange={e => setStudentForm({ ...studentForm, rollNo: e.target.value })} required />
              <input placeholder="Class" value={studentForm.className} onChange={e => setStudentForm({ ...studentForm, className: e.target.value })} required />
              <button type="submit">{editingStudentId ? "Update" : "Add"} Student</button>
            </form>
            <ul>
              {students.map(s => (
                <li key={s.id}>
                  {s.name} — {s.rollNo} — {s.className}
                  <button onClick={() => startEditStudent(s)} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteStudent(s.id)} style={{ marginLeft: 8 }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Attendance */}
        {activeTab === "attendance" && (
          <div>
            <h2>Mark Attendance ({date})</h2>
            <input type="date" value={date} onChange={e => { setDate(e.target.value); loadAttendance(); }} />
            <ul>
              {students.map(s => (
                <li key={s.id} style={{ marginBottom: 5 }}>
                  {s.name} 
                  <button onClick={() => markAttendance(s.id, "Present")} style={{ marginLeft: 8, backgroundColor: localAtt[s.id] === "Present" ? "green" : "" }}>✔ Present</button>
                  <button onClick={() => markAttendance(s.id, "Absent")} style={{ marginLeft: 8, backgroundColor: localAtt[s.id] === "Absent" ? "red" : "" }}>✖ Absent</button>
                  {localAtt[s.id] && <span style={{ marginLeft: 8 }}>{localAtt[s.id]}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <div>
            <h2>Reports</h2>
            <form onSubmit={addOrUpdateReport} style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
              <select value={reportForm.studentId} onChange={e => setReportForm({ ...reportForm, studentId: e.target.value })} required>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input placeholder="Term" value={reportForm.term} onChange={e => setReportForm({ ...reportForm, term: e.target.value })} required />
              <textarea placeholder='Grades JSON {"Math":85}' value={reportForm.gradesJson} onChange={e => setReportForm({ ...reportForm, gradesJson: e.target.value })} required />
              <button type="submit">{reportForm.id ? "Update" : "Add"} Report</button>
            </form>
            <div style={{ maxHeight: 300, overflowY: "auto" }}>
              {reports.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid #ccc", marginBottom: 4, paddingBottom: 4 }}>
                  <strong>{r.student?.name}</strong> — {r.term} — {JSON.stringify(r.gradesJson)}
                  <button onClick={() => startEditReport(r)} style={{ marginLeft: 8 }}>Edit</button>
                  <button onClick={() => deleteReport(r.id)} style={{ marginLeft: 4 }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics */}
        {activeTab === "analytics" && (
          <div>
            <h2>Analytics</h2>
            <select onChange={e => fetchAnalytics(e.target.value)} value={selectedStudent}>
              <option value="">Select Student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {avg && <p>Average grade: {avg.averageGrade.toFixed(2)}</p>}
            {attPct && <p>Attendance: {attPct.attendancePercent.toFixed(2)}%</p>}
            {chartData.length > 0 && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avg" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

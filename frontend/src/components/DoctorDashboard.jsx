import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationCenter from "./NotificationCenter";

function DoctorDashboard() {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [doctorStats, setDoctorStats] = useState({ totalAppointments: 0, totalPatients: 0 });
  const navigate = useNavigate();


  const handleConfirm = async (appointmentId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/doctor/appointments/update/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'confirmed' })
    });
  
    const data = await response.json();
    if (response.ok) {
      setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'confirmed' } : appt));
    } else {
      console.error(data.message);
    }
  };
  
  const handleReject = async (appointmentId) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/doctor/appointments/update/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'rejected' })
    });
  
    const data = await response.json();
    if (response.ok) {
      setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'rejected' } : appt));
    } else {
      console.error(data.message);
    }
  };
  
  const handleReschedule = async (appointmentId, newDate, newTime) => {
    const rescheduleMessage = prompt("Enter a message for rescheduling:");
  
  if (!rescheduleMessage) {
    alert("Reschedule message is required!");
    return;
  }

    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:5000/api/doctor/appointments/update/${appointmentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'rescheduled', newDate, newTime, rescheduleMessage })
    });
  
    const data = await response.json();
    if (response.ok) {
      setAppointments(prev => prev.map(appt => appt._id === appointmentId ? { ...appt, status: 'rescheduled', date: newDate, time: newTime, rescheduleMessage } : appt));
    } else {
      console.error(data.message);
    }
  };
  

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      // console.log("Token:", token);
      try {
        const response = await fetch("http://localhost:5000/api/doctor/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setDoctor(data); // directly setting the doctor profile
        } else {
          setError(data.message || "Failed to fetch doctor profile");
        }
      } catch (err) {
        setError("An error occurred while fetching profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/doctor/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setDoctorStats(data);
        } else {
          console.error("Failed to fetch doctor stats:", data.message);
        }
      } catch (err) {
        console.error("Error fetching doctor stats:", err);
      }
    };
  
    fetchStats();
  }, []);
  

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/doctor/appointments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setAppointments(data.appointments || []);
        } else {
          console.error("Failed to fetch appointments:", data.message);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
  
    if (selectedSection === "appointments") {
      fetchAppointments();
    }
  }, [selectedSection]);
  

  const renderContent = () => {
    if (selectedSection === "profile") {
      if (loading) {
        return <p className="text-gray-600 text-lg">Loading profile...</p>;
      }
  
      if (error) {
        return <p className="text-red-500 text-lg">{error}</p>;
      }
  
      return (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-[#333333]">Welcome, {doctor?.name}</h2>
  
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition">
              <h3 className="text-gray-600 text-sm">Total Patients</h3>
              <p className="text-3xl font-semibold text-black mt-2">
                  {doctorStats.totalPatients}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition">
              <h3 className="text-gray-600 text-sm">Total Appointments</h3>
              <p className="text-3xl font-semibold text-black mt-2">
                {doctorStats.totalAppointments}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 border hover:shadow-xl transition">
              <h3 className="text-gray-600 text-sm">Specialization</h3>
              <p className="text-xl font-medium text-black mt-2">
                {doctor?.specialization || "Not available"}
              </p>
            </div>
          </div>

          {/* Additional Doctor Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border">
            <h3 className="text-2xl font-bold text-black mb-6">Profile Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Full Name</p>
                <p className="text-lg text-black mt-1">{doctor?.name}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Email</p>
                <p className="text-lg text-black mt-1">{doctor?.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Specialization</p>
                <p className="text-lg text-black mt-1">{doctor?.specialization}</p>
              </div>
              {doctor?.diseasesTreated && doctor.diseasesTreated.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Diseases Treated</p>
                  <p className="text-lg text-black mt-1">{doctor.diseasesTreated.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else if (selectedSection === "appointments") {
      return (
        <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-600">No appointments found.</p>
      ) : (
        appointments.map((appt) => {
          const statusColors = {
            pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
            confirmed: { bg: "bg-green-100", text: "text-green-800", label: "Confirmed" },
            rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejected" },
            rescheduled: { bg: "bg-blue-100", text: "text-blue-800", label: "Rescheduled" }
          };
          const statusColor = statusColors[appt.status] || statusColors.pending;

          return (
          <div key={appt._id} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl border border-[#fbeaea] space-y-3">
            {/* Patient Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#f597dc] flex items-center justify-center text-white font-bold">
                {appt.patientId?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-semibold text-black">{appt.patientId?.name}</p>
                <p className="text-sm text-gray-600">{appt.patientId?.email}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600"><strong>Date:</strong></p>
                <p className="text-black">{new Date(appt.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600"><strong>Time:</strong></p>
                <p className="text-black">{appt.time}</p>
              </div>
              {appt.patientId?.phone && (
                <div>
                  <p className="text-gray-600"><strong>Phone:</strong></p>
                  <p className="text-black">{appt.patientId.phone}</p>
                </div>
              )}
              {appt.patientId?.age && (
                <div>
                  <p className="text-gray-600"><strong>Age:</strong></p>
                  <p className="text-black">{appt.patientId.age}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                {statusColor.label}
              </span>
            </div>

            {appt.status === 'rescheduled' && appt.rescheduleMessage && (
              <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                <strong>Reschedule Note:</strong> {appt.rescheduleMessage}
              </p>
            )}
        
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleConfirm(appt._id)}
                disabled={appt.status !== "pending"}
                className={`text-white p-2 rounded transition ${
                  appt.status !== "pending"
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-[#9fe3a1] hover:bg-[#81f287]"
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => handleReject(appt._id)}
                disabled={appt.status !== "pending"}
                className={`text-white p-2 rounded transition ${
                  appt.status !== "pending"
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-[#e79690] hover:bg-[#fe8484]"
                }`}
              >
                Reject
              </button>
              <button
                onClick={() => {
                  const newDate = prompt("Enter new date (YYYY-MM-DD):");
                  const newTime = prompt("Enter new time (HH:MM):");
                  if (newDate && newTime) {
                    handleReschedule(appt._id, newDate, newTime);
                  }
                }}
                disabled={appt.status !== "pending"}
                className={`text-white p-2 rounded transition ${
                  appt.status !== "pending"
                    ? "bg-gray-400 cursor-not-allowed opacity-50"
                    : "bg-[#87b3d4] hover:bg-[#7faaf9]"
                }`}
              >
                Reschedule
              </button>
            </div>
          </div>
        );
        })
        
      )}
    </div>
      );
    } 
  };
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/")
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#f8fafc] to-[#fbeaea] border-r shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-10 text-gray-900">
            Doctor Dashboard
          </h2>
          <ul className="space-y-4">
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  selectedSection === "profile"
                  ? "bg-[#fbeaea] text-black font-semibold" // Light pink background for selected
                  : "text-gray-600 hover:bg-[#fbeaea] hover:text-black" // Soft hover effect
                }`}
                onClick={() => setSelectedSection("profile")}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left py-2 px-4 rounded-lg ${
                  selectedSection === "appointments"
                  ? "bg-[#fbeaea] text-black font-semibold" // Light pink background for selected
                  : "text-gray-600 hover:bg-[#fbeaea] hover:text-black" // Soft hover effect
                }`}
                onClick={() => setSelectedSection("appointments")}
              >
                Appointments
              </button>
            </li>
          </ul>
        </div>

        <button
          className="text-red-500 hover:border-black font-medium"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-b from-[#fbeaea] to-[#ffffff] p-10">
        <div className="flex justify-end mb-6">
          <NotificationCenter />
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default DoctorDashboard;

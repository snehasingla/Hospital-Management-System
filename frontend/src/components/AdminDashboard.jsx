import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit, FiLogOut, FiUsers, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import NotificationCenter from './NotificationCenter';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    rejectedAppointments: 0,
  });
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const token = localStorage.getItem('token');

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns totalUsers, totalDoctors, totalPatients, totalAppointments
        setDashboardStats({
          totalPatients: data.totalPatients || 0,
          totalDoctors: data.totalDoctors || 0,
          totalAdmins: (data.totalUsers != null) ? Math.max(0, data.totalUsers - (data.totalDoctors || 0) - (data.totalPatients || 0)) : 0,
          pendingAppointments: data.pendingAppointments || 0,
          confirmedAppointments: data.confirmedAppointments || 0,
          rejectedAppointments: data.rejectedAppointments || 0,
          totalAppointments: data.totalAppointments || 0,
        });
      } else {
        setError('Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError('Error fetching dashboard stats: ' + err.message);
    }
    setLoading(false);
  };

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // backend returns array of users or { users: [...] }
        setUsers(Array.isArray(data) ? data : (data.users || []));
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users: ' + err.message);
    }
    setLoading(false);
  };

  // Fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // backend returns array of appointments or { appointments: [...] }
        setAppointments(Array.isArray(data) ? data : (data.appointments || []));
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Error fetching appointments: ' + err.message);
    }
    setLoading(false);
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId));
        alert('User deleted successfully');
      } else {
        setError('Failed to delete user');
      }
    } catch (err) {
      setError('Error deleting user: ' + err.message);
    }
  };

  // Update user role
  const updateUserRole = async (userId, role) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      if (response.ok) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role } : u)));
        setEditingUser(null);
        alert('User role updated successfully');
        fetchDashboardStats();
      } else {
        setError('Failed to update user role');
      }
    } catch (err) {
      setError('Error updating user role: ' + err.message);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/');
  };

  useEffect(() => {
    if (selectedSection === 'dashboard') fetchDashboardStats();
    else if (selectedSection === 'users') fetchUsers();
    else if (selectedSection === 'appointments') fetchAppointments();
  }, [selectedSection]);

  const renderContent = () => {
    if (loading) return <div className="text-center py-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

    if (selectedSection === 'dashboard') {
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.totalPatients}</p>
                </div>
                <FiUsers className="w-12 h-12 text-blue-500 opacity-30" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Doctors</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.totalDoctors}</p>
                </div>
                <FiUsers className="w-12 h-12 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Admins</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.totalAdmins}</p>
                </div>
                <FiEdit className="w-12 h-12 text-purple-500 opacity-30" />
              </div>
            </div>

            {/* Appointment Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Appointments</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.pendingAppointments}</p>
                </div>
                <FiCalendar className="w-12 h-12 text-yellow-500 opacity-30" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Confirmed Appointments</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.confirmedAppointments}</p>
                </div>
                <FiCalendar className="w-12 h-12 text-green-500 opacity-30" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Rejected Appointments</p>
                  <p className="text-3xl font-bold text-gray-800">{dashboardStats.rejectedAppointments}</p>
                </div>
                <FiCalendar className="w-12 h-12 text-red-500 opacity-30" />
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedSection === 'users') {
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Users Management</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingUser === user._id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="px-3 py-1 border rounded"
                        >
                          <option value="">Select Role</option>
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {editingUser === user._id ? (
                        <>
                          <button
                            onClick={() => updateUserRole(user._id, newRole)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingUser(user._id);
                              setNewRole(user.role);
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
                          >
                            <FiEdit className="w-4 h-4" /> Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1"
                          >
                            <FiTrash2 className="w-4 h-4" /> Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (selectedSection === 'appointments') {
      return (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">All Appointments</h2>
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div key={appt._id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-semibold text-gray-800">{appt.patientId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-semibold text-gray-800">{appt.doctorId?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(appt.date).toLocaleDateString()} at {appt.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      appt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      appt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      appt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booked On</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(appt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-lg flex flex-col justify-between p-6">
        <div>
          <h2 className="text-2xl font-bold mb-10">Admin Dashboard</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedSection('dashboard')}
                className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 ${
                  selectedSection === 'dashboard'
                    ? 'bg-blue-600 font-semibold'
                    : 'hover:bg-gray-700'
                }`}
              >
                <FiTrendingUp className="w-5 h-5" />
                Dashboard
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection('users')}
                className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 ${
                  selectedSection === 'users'
                    ? 'bg-blue-600 font-semibold'
                    : 'hover:bg-gray-700'
                }`}
              >
                <FiUsers className="w-5 h-5" />
                Users
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection('appointments')}
                className={`w-full text-left py-2 px-4 rounded-lg flex items-center gap-2 ${
                  selectedSection === 'appointments'
                    ? 'bg-blue-600 font-semibold'
                    : 'hover:bg-gray-700'
                }`}
              >
                <FiCalendar className="w-5 h-5" />
                Appointments
              </button>
            </li>
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium"
        >
          <FiLogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-10">
        <div className="flex justify-end mb-6">
          <NotificationCenter />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import NotificationCenter from './NotificationCenter';

// Memoized Edit Profile Modal Component to prevent focus issues
const EditProfileModal = memo(({ showEditProfile, editProfileData, editErrors, handleEditChange, submitEditProfile, setShowEditProfile }) => {
  if (!showEditProfile) return null;
  const hasErrors = Object.values(editErrors).some(Boolean);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" name="name" value={editProfileData.name || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Name" />
            {editErrors.name && <p className="text-red-500 text-sm">{editErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input type="number" name="age" value={editProfileData.age || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Age" />
            {editErrors.age && <p className="text-red-500 text-sm">{editErrors.age}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <input type="text" name="gender" value={editProfileData.gender || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Gender" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" value={editProfileData.phone || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Phone" />
            {editErrors.phone && <p className="text-red-500 text-sm">{editErrors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" value={editProfileData.address || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Address" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <input type="text" name="bloodGroup" value={editProfileData.bloodGroup || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Blood Group" />
            {editErrors.bloodGroup && <p className="text-red-500 text-sm">{editErrors.bloodGroup}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
            <input type="text" name="allergies" value={editProfileData.allergies || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Allergies" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical History (comma separated)</label>
            <input type="text" name="medicalHistory" value={editProfileData.medicalHistory || ''} onChange={handleEditChange} className="w-full p-2 border rounded" placeholder="Medical History" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setShowEditProfile(false)} className="px-4 py-2 border rounded">Cancel</button>
          <button disabled={hasErrors} onClick={submitEditProfile} className={`px-4 py-2 rounded ${hasErrors ? 'bg-gray-300 text-gray-600' : 'bg-[#f597dc] text-white'}`}>Save</button>
        </div>
      </div>
    </div>
  );
});

EditProfileModal.displayName = 'EditProfileModal';

function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [doctorResults, setDoctorResults] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [specializations, setSpecializations] = useState([]); // New state for dynamic specializations
  const [loadingSpecializations, setLoadingSpecializations] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
  const response = await fetch('http://localhost:5000/api/patient/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setPatient(data);
        } else {
          setError(data.message || 'Failed to fetch patient profile');
        }
      } catch (err) {
        setError('An error occurred while fetching profile.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch all specializations for dynamic dropdown
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/specializations');
        const data = await response.json();
        if (response.ok) {
          setSpecializations(data);
        } else {
          console.error('Failed to fetch specializations');
        }
      } catch (err) {
        console.error('Error fetching specializations:', err);
      } finally {
        setLoadingSpecializations(false);
      }
    };

    fetchSpecializations();
  }, []);

  // fetchAppointments is declared here so other handlers (like booking) can re-use it
  const fetchAppointments = async () => {
    const token = localStorage.getItem('token');
    console.log('PatientDashboard: token=', token);
    try {
      const response = await fetch('http://localhost:5000/api/patient/appointments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('PatientDashboard: appointments response status=', response.status);
      const data = await response.json();
      console.log('PatientDashboard: appointments response body=', data);

      if (response.ok) {
        setAppointments(data.appointments);
      } else {
        setError(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError('An error occurred while fetching appointments.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const { transcript, resetTranscript } = useSpeechRecognition();

  const startVoiceSearch = () => {
    SpeechRecognition.startListening({
      continuous: true,
      language: 'en-US'
    });
  };

  const stopVoiceSearch = () => {
    SpeechRecognition.stopListening();
    processVoiceCommandForSearch();
  };

  const processVoiceCommandForSearch = () => {
    const voiceCommand = transcript.toLowerCase();
    const specializations = ["dermatologist", "cardiologist", "pediatrician", "neurologist"];

    let selectedSpecialization = null;

    specializations.forEach(spec => {
      if (voiceCommand.includes(spec)) {
        selectedSpecialization = spec;
      }
    });

    if (selectedSpecialization) {
      setSpecialization(selectedSpecialization);

      const pattern = new RegExp(`(find|search for)?\\s*${selectedSpecialization}\\s*(for)?\\s*(.*)`);
      const match = voiceCommand.match(pattern);

      let diseasePart = "";
      if (match && match[3]) {
        diseasePart = match[3].trim();
      }

      setSearchQuery(diseasePart.replace(/\.$/, ''));
    } else {
      // If no specialization detected but user said something, use it as search query for disease
      if (voiceCommand.trim().length > 0) {
        setSearchQuery(voiceCommand.trim());
        setSpecialization('');
      } else {
        console.log("No voice input detected.");
      }
    }
    resetTranscript();
  };

  useEffect(() => {
    // Trigger search if specialization changes (including empty string for 'All') or searchQuery changes
    if (specialization !== undefined) {
      searchDoctors();
    }
    // eslint-disable-next-line
  }, [specialization, searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const openEditProfile = () => {
    setEditProfileData({
      name: patient?.name || '',
      age: patient?.age || '',
      gender: patient?.gender || '',
      phone: patient?.phone || '',
      address: patient?.address || '',
      bloodGroup: patient?.bloodGroup || '',
      medicalHistory: (patient?.medicalHistory || []).join(', '),
      allergies: (patient?.allergies || []).join(', '),
    });
    setShowEditProfile(true);
  };

  // Use functional update to avoid caret/focus issues when updating controlled inputs
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData(prev => ({ ...prev, [name]: value }));
    // Validate field on change
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let msg = '';
    if (name === 'name') {
      if (!value || value.trim().length === 0) msg = 'Name is required';
    }
    if (name === 'age' && value) {
      const n = Number(value);
      if (Number.isNaN(n) || n < 0 || n > 120) msg = 'Enter a valid age';
    }
    if (name === 'phone' && value) {
      const phoneRe = /^[0-9()+\-\s]{7,20}$/;
      if (!phoneRe.test(value)) msg = 'Invalid phone number';
    }
    if (name === 'bloodGroup' && value) {
      const bg = value.toUpperCase();
      const valid = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];
      if (value && !valid.includes(bg)) msg = 'Invalid blood group (e.g. A+)';
    }

    setEditErrors(prev => ({ ...prev, [name]: msg }));
    return msg === '';
  };

  const submitEditProfile = async () => {
    const token = localStorage.getItem('token');
    // run final validation
    const fieldsToCheck = ['name','age','phone','bloodGroup'];
    for (const f of fieldsToCheck) {
      if (!validateField(f, editProfileData[f] || '')) {
        alert('Please fix form errors before saving.');
        return;
      }
    }
    try {
      const payload = {
        ...editProfileData,
        medicalHistory: editProfileData.medicalHistory ? editProfileData.medicalHistory.split(',').map(s => s.trim()) : [],
        allergies: editProfileData.allergies ? editProfileData.allergies.split(',').map(s => s.trim()) : [],
      };

      const response = await fetch('http://localhost:5000/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setPatient(data.user);
        setShowEditProfile(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-600 text-lg">Loading profile...</p>;
    }

    if (error) {
      return <p className="text-red-500 text-lg">{error}</p>;
    }

    return (
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-black">Welcome, {patient?.name || ""}!</h2>
        <div className="mb-4">
          <button onClick={openEditProfile} className="px-4 py-2 rounded bg-[#f597dc] text-white">Edit Profile</button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center space-y-4 border border-[#fbeaea]">
          <div className="w-24 h-24 rounded-full bg-[#fbeaea] flex items-center justify-center text-3xl text-black">
            {patient?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Name: </span>{patient?.name}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Email: </span>{patient?.email}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Age: </span>{patient?.age || 'N/A'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Gender: </span>{patient?.gender || 'N/A'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Phone: </span>{patient?.phone || 'N/A'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Address: </span>{patient?.address || 'N/A'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Blood Group: </span>{patient?.bloodGroup || 'N/A'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Allergies: </span>{(patient?.allergies || []).join(', ') || 'None'}
            </p>
            <p className="text-lg text-gray-800">
              <span className="font-semibold text-black">Medical History: </span>{(patient?.medicalHistory || []).join(', ') || 'None'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const searchDoctors = async () => {
    setLoadingDoctors(true);
    const token = localStorage.getItem('token');

    try {
      // Build query params from specialization and searchQuery (disease)
      const params = new URLSearchParams();
      if (specialization) params.append('specialization', specialization);
      if (searchQuery) params.append('disease', searchQuery);

      const url = `http://localhost:5000/api/doctors/search?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setDoctorResults(data);
      } else {
        setError(data.message || 'No doctors found');
      }
    } catch (err) {
      setError('An error occurred while searching for doctors.');
      console.error(err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleBooking = async (doctorId) => {
    const token = localStorage.getItem('token');
    const patientId = patient?._id;

    if (!patientId) {
      alert('Patient ID not found!');
      return;
    }

    const appointmentDetails = {
      patientId,
      doctorId,
      date: appointmentDate,
      time: appointmentTime,
    };

    try {
      const response = await fetch('http://localhost:5000/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentDetails),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Appointment booked successfully!');
        setShowBookingModal(false);
        // Clear selected fields
        setSelectedDoctorId(null);
        setAppointmentDate('');
        setAppointmentTime('');
        // Refresh appointments so the new one shows without page reload
        await fetchAppointments();
      } else {
        alert(data.message || 'Failed to book appointment');
      }
    } catch (err) {
      alert('An error occurred while booking the appointment');
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#f8fafc] to-[#fbeaea] border-r shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-10 text-gray-900">
            Patient Dashboard
          </h2>
          <button
            onClick={() => setActiveTab('profile')}
            className={`block mb-3 w-full text-left px-4 py-2 rounded-lg ${
              activeTab === 'profile'
                ? 'bg-[#fbeaea] text-black font-semibold'
                : 'text-gray-600 hover:bg-[#fbeaea] hover:text-black'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`block mb-3 w-full text-left px-4 py-2 rounded-lg ${
              activeTab === 'book'
                ? 'bg-[#fbeaea] text-black font-semibold'
                : 'text-gray-600 hover:bg-[#fbeaea] hover:text-black'
            }`}
          >
            Book Appointment
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`block mb-3 w-full text-left px-4 py-2 rounded-lg ${
              activeTab === 'past'
                ? 'bg-[#fbeaea] text-black font-semibold'
                : 'text-gray-600 hover:bg-[#fbeaea] hover:text-black'
            }`}
          >
            All Appointments
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-600 text-left px-4 py-2 hover:border-black"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gradient-to-b from-[#fbeaea] to-[#ffffff] p-10">
        <div className="flex justify-end mb-6">
          <NotificationCenter />
        </div>
        {activeTab === 'profile' && renderContent()}

        {activeTab === 'book' && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">Book an Appointment</h2>

            {/* Voice Search Button */}
            <div className="mb-6">
              <button
                onClick={startVoiceSearch}
                className="mt-2 md:mt-0 px-4 py-2 text-black rounded-lg hover:border-black bg-white"
              >
                Start Voice Search
              </button>
              <button
                onClick={stopVoiceSearch}
                className="mt-2 md:mt-0 px-4 py-2 text-black rounded-lg hover:border-black bg-white"
              >
                Stop Voice Search
              </button>
            </div>

            {/* Search Section */}
            <div className="mb-6 flex flex-col md:flex-row md:space-x-4">
              <input
                type="text"
                placeholder="Search by disease or specialization"
                className="w-full md:w-1/2 px-4 py-2 border rounded-lg focus:outline-none mb-4 md:mb-0 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none mb-4 md:mb-0 text-black"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec.charAt(0).toUpperCase() + spec.slice(1)}
                  </option>
                ))}
              </select>
              <button
                className="mt-2 md:mt-0 px-4 py-2 text-black rounded-lg hover:border-black bg-white"
                onClick={searchDoctors}
                disabled={loadingDoctors}
              >
                {loadingDoctors ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Doctor Cards */}
            {loadingDoctors ? (
              <p>Loading doctors...</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctorResults.length > 0 ? (
                  doctorResults.map((doctor) => (
                    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-[#fbeaea]" key={doctor._id}>
                      {/* Doctor Avatar */}
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-[#f597dc] flex items-center justify-center text-white text-2xl font-bold mr-4">
                          {doctor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-black">{doctor.name}</h3>
                          <p className="text-sm text-[#f597dc] font-medium">{doctor.specialization}</p>
                        </div>
                      </div>
                      
                      {/* Doctor Details */}
                      <div className="space-y-2 mb-4 text-sm">
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span>
                          <p className="text-gray-600">{doctor.email}</p>
                        </div>
                        {doctor.diseasesTreated && doctor.diseasesTreated.length > 0 && (
                          <div>
                            <span className="font-semibold text-gray-700">Treats:</span>
                            <p className="text-gray-600">{doctor.diseasesTreated.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Book Button */}
                      <button
                        onClick={() => {
                          setSelectedDoctorId(doctor._id);
                          setShowBookingModal(true);
                        }}
                        className="w-full mt-4 px-4 py-2 bg-[#f597dc] text-white rounded-lg font-medium hover:bg-[#e57fc4] transition"
                      >
                        Book Appointment
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-lg col-span-full">No doctors found matching your search criteria.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex justify-center items-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4">Book Appointment</h3>

              {/* Date and Time Picker */}
              <div className="mb-6 flex flex-col md:flex-row md:space-x-4">
                <input
                  type="date"
                  className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none mb-4 md:mb-0 text-black"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                />
                <input
                  type="time"
                  className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none mb-4 md:mb-0 text-black"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-black rounded-lg hover:border-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBooking(selectedDoctorId)}
                  className="px-4 py-2 text-black rounded-lg hover:border-black"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'past' && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-black">All Appointments</h2>
            {appointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map(appointment => (
                  <div
                    key={appointment._id}
                    className="bg-white rounded-xl shadow-lg border border-[#fbeaea] p-5 flex flex-col gap-3 hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <h3 className="text-xl font-semibold text-black">
                      Doctor: {appointment.doctorId?.name || "Unknown"}
                    </h3>
                    <div className="flex justify-between text-gray-700 text-sm">
                      <span>Date: {appointment.date ? new Date(appointment.date).toLocaleDateString() : "N/A"}</span>
                      <span>Time: {appointment.time || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium text-gray-800">Status:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : appointment.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {appointment.status || "Pending"}
                      </span>
                    </div>
                    {appointment.status === 'rescheduled' && appointment.rescheduleMessage && (
                      <p className="text-sm text-yellow-700 mt-1">
                        <strong>Reschedule Note from Doctor:</strong> {appointment.rescheduleMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-600 bg-[#fbeaea] p-6 rounded-xl">
                <p className="text-lg font-semibold mb-2">No Appointments Found</p>
                <p className="text-sm">You haven't booked any appointments yet!</p>
              </div>
            )}
          </div>
        )}
        {/* Render Edit Profile modal */}
        <EditProfileModal 
          showEditProfile={showEditProfile} 
          editProfileData={editProfileData} 
          editErrors={editErrors} 
          handleEditChange={handleEditChange} 
          submitEditProfile={submitEditProfile} 
          setShowEditProfile={setShowEditProfile} 
        />

      </div>
    </div>
  );
}

export default PatientDashboard;

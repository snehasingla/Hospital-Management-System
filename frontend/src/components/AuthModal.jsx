import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import

function AuthModal({ isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient', // Default role is 'patient' for signup
    specialization: '',
    diseasesTreated: '',

  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // track whether modal shows signup or login form
  const [isSignup, setIsSignup] = useState(false);

  const navigate = useNavigate();  // Initialize useNavigate hook

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    let url;
    let payload;
  
    if (isSignup) {
      url = 'http://localhost:5000/signup';
      payload = formData;

            
    } else {
      url = 'http://localhost:5000/login';
      payload = { email: formData.email, password: formData.password };
    }

    // If signing up as a doctor and diseasesTreated was entered as a comma-separated string,
    // convert it to an array before sending to the backend.
    if (isSignup && payload.role === 'doctor' && typeof payload.diseasesTreated === 'string') {
      payload.diseasesTreated = payload.diseasesTreated
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

  // Debug: log before sending so we can see if handler runs and what payload is used.
  console.log('AuthModal submit', { isSignup, url, payload });
  setIsLoading(true);
  setStatusMessage('Submitting...');
  setError('');

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log('Backend response:', data);

        // Unified success check: backend returns a token on success for both signup and login.
        if (data.token) {
          // Successful auth (either signup returned a token or a login)
          const role = data.user?.role;
          // Persist token and user for authenticated requests
          try {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user || {}));
            // backend returns user.id (string) on signup/login, sometimes _id
            const uid = data.user?.id || data.user?._id || '';
            localStorage.setItem('userId', uid);
          } catch (e) {
            console.warn('Unable to persist token to localStorage', e);
          }
          if (role === 'doctor') {
            navigate('/doctor-dashboard');
          } else if (role === 'patient') {
            navigate('/patient-dashboard');
          } else if (role === 'admin') {
            navigate('/admin-dashboard');
          }

          setIsOpen(false);
          setStatusMessage('Success');
          setIsLoading(false);
          console.log('Authentication successful', data);
          return;
        }

        // If we get here, no token was returned -> show backend error message.
        const msg = data.error || data.message || 'Authentication failed. Please try again.';
        setError(msg);
        setStatusMessage('');
        setIsLoading(false);
      })
      .catch((error) => {
        setError('An error occurred. Please try again later.');
        setStatusMessage('');
        setIsLoading(false);
        console.error('Error during authentication:', error);
      });
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      <div className="relative bg-[#fbeaea] rounded-2xl shadow-xl w-full max-w-sm p-6 auth-modal">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:border-black"
        >
          ✕
        </button>

        <form className="space-y-4" onSubmit={handleSubmit}>
  {isSignup && (
    <div>
      <label className="block text-sm font-medium text-gray-700">Full name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
                placeholder="John Doe"
        className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        required
      />
    </div>
  )}

  <div>
    <label className="block text-sm font-medium text-gray-700">Email</label>
    <input
      type="email"
      name="email"
      value={formData.email}
      onChange={handleChange}
      placeholder="email@example.com"
      className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700">Password</label>
    <input
      type="password"
      name="password"
      value={formData.password}
      onChange={handleChange}
      placeholder="Enter your password"
      className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
  </div>

  {isSignup && (
    <div>
      <label className="block text-sm font-medium text-gray-700">Role</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        required
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  )}

  {/* Show Specialization input only when role is doctor */}
  {isSignup && formData.role === 'doctor' && (
    <div>
      <label className="block text-sm font-medium text-gray-700">Specialization</label>
      <input
        type="text"
        name="specialization"
        value={formData.specialization || ''}
        onChange={handleChange}
        placeholder="e.g. Cardiologist"
        className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        required
      />
    </div>
  )}

{isSignup && formData.role === 'doctor' && (
  <div>
    <label className="block text-sm font-medium text-gray-700">Diseases Treated (comma-separated)</label>
    <input
      type="text"
      name="diseasesTreated"
      value={formData.diseasesTreated}
      onChange={handleChange}
      placeholder="e.g. diabetes, hypertension"
      className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
      required
    />
  </div>
)}


  <button type="submit" className="w-full py-2 rounded-lg text-lg hover:border-black ">
    {isSignup ? 'Sign up' : 'Log in'}
  </button>
  {isLoading && <p className="text-center text-sm text-gray-600">{statusMessage}</p>}
  {error && <p className="text-center text-sm text-red-500">{error}</p>}
</form>

        <p className="text-center text-gray-600 text-sm mt-4">
          {isSignup ? 'Already have an account?' : 'New here?'}
          <button onClick={toggleMode} className="text-black font-medium ml-1">
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;

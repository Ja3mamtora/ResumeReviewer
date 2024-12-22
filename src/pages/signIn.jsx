import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Lock, Eye, EyeOff, FileText, ArrowRight } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signInError, setSignInError] = useState(null);
  const [isSubmiting, setSubmiting] = useState(false);
  const { authState, login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    setSubmiting(true);
    event.preventDefault();
    setSignInError(null);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('https://adaptive-learning-v1.onrender.com/authentication/login', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();
      if (data && data.access_token) {
        login(data.access_token);
        toast.success('Signed in successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setSubmiting(false);
        throw new Error('No token received from the server');
      }
    } catch (error) {
      setSignInError('Failed to sign in. Please check your credentials and try again.');
      toast.error('Sign-in failed. Please try again.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    toast.info('Welcome to Resume Reviewer!', {
      position: 'top-right',
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []);

  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" replace={true} />;
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1602407294553-6ac9170b3ed0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlc3VtZXxlbnwwfHwwfHx8Mg%3D%3D')",
      }}
    >
      <div className="bg-white bg-opacity-95 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-800">Resume Reviewer</h2>
          <p className="mt-2 text-center text-gray-600">Sign in to access your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            {isSubmiting ? 'Signing in... ' : 'Sign In'}
            <ArrowRight className="ml-2 h-4 w-4" /> 
          </button>
        </form>
        {signInError && (
          <div
            className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{signInError}</span>
          </div>
        )}
        <div className="mt-6 text-center">
          <a href="/signup" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Don't have an account? <span className="font-semibold">Sign up for free</span>
          </a>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

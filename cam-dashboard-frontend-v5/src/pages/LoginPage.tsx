// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import homeImage from '../assets/images/HomePage_2.jpg';


// Define props interface for clarity
interface LoginPageProps {
  onLoginSuccess: () => void; // A function to call when login is successful
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [Register,SetRegister] = useState(false);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    setError(null); // Clear any previous errors
    setLoading(true); // Show loading state

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    // --- Mock API Call (REPLACE THIS WITH YOUR ACTUAL NODE.JS BACKEND CALL) ---
    try {
      if(!Register){
      console.log('Attempting login with:', { email, password, rememberMe });
        const response = await fetch("https://localhost:5000/auth/login",{
          method:"POST",
          headers:{"Content-type":"application/json"},
          body: JSON.stringify({email,password})
        })

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(data.message);
        
        onLoginSuccess(); 
      } else {
        setError(data.message); // Display error message from mock API
      }
    }
    else{
      console.log('Attempting Sign Up with:', { email, password, rememberMe });
        const response = await fetch("https://localhost:5000/auth/register",{
          method:"POST",
          headers:{"Content-type":"application/json"},
          body: JSON.stringify({email,password})
        })

      const data = await response.json();

      if (response.ok && data.success) {
        console.log(data.message);
        
        onLoginSuccess(); 
      } else {
        setError(data.message); // Display error message from mock API
      }
    }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.'); // Generic error for unexpected issues
    } finally {
      setLoading(false); // End loading state
    }
  };

  return (
    // Full viewport height, centered content, light gray background
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
      {/* Form Section*/}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
          {/* Logo/Icon Area */}
          <div className="flex justify-center mb-6">
            {/* This is a placeholder SVG icon. Replace with your actual dashboard logo. */}
            <svg className="h-20 w-20 text-blue-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h2v-2h-2v2zm2-14H11v10h2V5z" />
            </svg>
          </div>

          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
            Welcome Back!
          </h2>
          {Register?
          <p className="text-center text-lg text-gray-600 mb-8">
            Sign in to your CAM Machine Monitoring Dashboard
          </p>:<p className="text-center text-lg text-gray-600 mb-8">
            Sign Up to your CAM Machine Monitoring Dashboard
          </p>

}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-sm" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="********"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {/* Sign In Button */}
            <div>
              <button
                type="submit"
                disabled={loading} // Disable button when loading
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </div>

            {/* Optional: Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button onClick={()=>{SetRegister(!Register)}}>Sign In</button>
              </p>
            </div>
          </form>

        </div>
      </div>
      {/* Image Section */}
      <div className="hidden lg:block w-full lg:w-full">
        <img
          src={homeImage}
          alt="Login Page"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default LoginPage;
// src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((fd) => ({ ...fd, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post('/auth/login', formData);
      sessionStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/images/login-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Branding */}
      <div className="relative z-10 text-center pt-16 md:pt-20 px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-[0_0_12px_#ffffff]">
          CODE TRACKER
        </h1>
        <p className="mt-3 text-xl md:text-2xl text-white drop-shadow-[0_0_6px_#ffffff]">
          Track. Analyze. Grow as a coder.
        </p>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-lg px-4 mt-16 flex justify-center">
        <Card
          className="px-8 py-6 rounded-2xl shadow-2xl 
          bg-gradient-to-br from-black via-gray-900 to-[#3b2f2f] 
          border border-gray-800/50 backdrop-blur-md w-full"
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-4 flex flex-col items-center"
          >
            <h2 className="text-3xl font-semibold text-white text-center mb-2">
              Log In
            </h2>

            {serverError && (
              <p className="text-red-500 text-base text-center">{serverError}</p>
            )}

            <div className="space-y-4 w-[90%]">
              <Input
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="text-base h-12 w-full"
              />

              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                className="text-base h-12 w-full"
                icon={showPassword ? 'EyeOff' : 'Eye'}
                iconPosition="right"
                variant="with-icon"
                onIconClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-[90%] mt-4 text-base py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in…' : 'Log In'}
            </Button>

            <p className="text-center text-sm text-gray-300 mt-2">
              Don’t have an account?{' '}
              <Link to="/register" className="text-blue-400 hover:underline">
                Register
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;

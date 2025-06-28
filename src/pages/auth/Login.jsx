import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(errs => ({ ...errs, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // client-side validation
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form 
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-surface p-6 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold text-text-primary mb-4 text-center">
          Log In
        </h2>

        {serverError && (
          <p className="text-error text-sm mb-4 text-center">{serverError}</p>
        )}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          className="mt-4"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-6"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Log In'}
        </Button>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Don’t have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

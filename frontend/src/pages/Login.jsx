// src/pages/Login.jsx — Professional centered login page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo.svg';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: 'admin@gemledger.com', password: '' },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await login(data.email, data.password);
      toast.success('Welcome back! Login successful.');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-modal border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-primary-700 px-8 py-8 text-center">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <img src={logo} alt="Professional Edge Global" className="w-12 h-12 object-contain" />
            </div>
            <h1 className="text-lg font-bold text-white leading-tight">Professional Edge Global</h1>
            <p className="text-white/70 text-[11px] font-medium tracking-widest uppercase mt-0.5">Pvt. Ltd.</p>
            <p className="text-primary-200 text-xs mt-2">ERP &amp; Management System</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <p className="text-sm font-medium text-gray-700 mb-6 text-center">Sign in to your account</p>

            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 mb-5">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">Email Address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                  placeholder="admin@gemledger.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                  })}
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-input pr-10 ${errors.password ? 'form-input-error' : ''}`}
                    placeholder="Enter your password"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                id="login-btn"
                disabled={loading}
                className="btn-primary w-full mt-2 py-2.5"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Help text */}
            <p className="text-center text-[11px] text-gray-400 mt-6">
              Default: admin@gemledger.com / Admin@1234
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          © {new Date().getFullYear()} Professional Edge Global Pvt. Ltd. · All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form@7.55.0';
import Button from '../../components/common/Button';
import { GraduationCap } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8EAF6] via-[#E3F2FD] to-[#F3E5F5] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#5B7EFF] to-[#7C9FFF] rounded-2xl mb-4 shadow-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-[#4F4F4F]">Timetable Management</h1>
          <p className="text-[#828282] mt-2">Sign in to access your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(91,126,255,0.08)] p-8 border border-gray-100/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] transition-all duration-200 bg-[#FAFBFD]"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-[#EB5757]">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#4F4F4F] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#5B7EFF]/50 focus:border-[#5B7EFF] transition-all duration-200 bg-[#FAFBFD]"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#EB5757]">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-[#EB5757]/10 border border-[#EB5757]/20 rounded-xl">
                <p className="text-sm text-[#EB5757] font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
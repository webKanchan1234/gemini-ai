import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const phoneSchema = z.object({
  country: z.string().nonempty('Country required'),
  phone: z.string().min(6, 'Invalid phone number'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter 6-digit OTP'),
});

const AuthPage = () => {
  const [countries, setCountries] = useState([]);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, darkMode } = useAuth();
  const [fakeOtp, setFakeOtp] = useState('');
  const navigate = useNavigate();

  const {
    register: registerPhone,
    handleSubmit: handlePhoneSubmit,
    formState: { errors: phoneErrors },
  } = useForm({ resolver: zodResolver(phoneSchema) });

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setValueOtp, 
  } = useForm({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,idd');
        const sorted = response.data
          .map(c => {
            const dialCode = c.idd?.root && c.idd?.suffixes?.length
              ? c.idd.root + c.idd.suffixes[0]
              : null;

            return dialCode ? {
              name: c.name.common,
              code: dialCode
            } : null;
          })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sorted);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      }
    };

    fetchCountries();
  }, []);



  const onPhoneSubmit = (data) => {
    setLoading(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setFakeOtp(otp);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      toast.success('OTP sent successfully');
      toast.info(`Your OTP is ${otp}`, { autoClose: 5000 });
    }, 1000);
    toast.success('OTP sent successfully');
  };
  useEffect(() => {
    if (fakeOtp && otpSent) {
      setTimeout(() => {
        setValueOtp('otp', fakeOtp);
      }, 2000);
    }
  }, [fakeOtp, otpSent]);

  const onOtpSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      login({ phone: 'logged-in' });
      toast.success('Login successful');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`p-6 rounded-lg shadow-md w-full max-w-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {otpSent ? 'Enter OTP' : 'Login with Phone'}
        </h2>

        {otpSent ? (
          <form onSubmit={handleOtpSubmit(onOtpSubmit)} className="space-y-4">
            <div>
              <input
                {...registerOtp('otp')}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter 6-digit OTP"
              />
              {otpErrors.otp && <p className="mt-1 text-sm text-red-500">{otpErrors.otp.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium ${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-200`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePhoneSubmit(onPhoneSubmit)} className="space-y-4">
            <div>
              <select
                {...registerPhone('country')}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="">Select Country</option>
                {countries.map((c, i) => (
                  <option key={i} value={c?.code}>
                    {c?.name} ({c?.code})
                  </option>
                ))}
              </select>
              {phoneErrors.country && <p className="mt-1 text-sm text-red-500">{phoneErrors.country.message}</p>}
            </div>
            <div>
              <input
                {...registerPhone('phone')}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Phone Number"
              />
              {phoneErrors.phone && <p className="mt-1 text-sm text-red-500">{phoneErrors.phone.message}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium ${loading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white transition duration-200`}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
import React, { useState } from 'react';
import { Box, Lock, Mail, User, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Auth = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'consumer' // 'admin' or 'consumer'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

            // If logging in, we only need email and password. Otherwise, send the whole form.
            // Replace this part inside handleSubmit:
            const payload = isLogin
                ? { email: formData.email, password: formData.password }
                : { name: formData.name, email: formData.email, password: formData.password };
            // Notice we dropped formData.role completely

            // Make the request to our Node backend
            const response = await axios.post(`http://localhost:5000${endpoint}`, payload);

            // Save the JWT token and user data to localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));

            // Trigger the login state in App.jsx
            onLogin(response.data);

        } catch (err) {
            // Capture and display errors from the backend
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="bg-brand-dark p-8 text-center text-white">
                    <div className="inline-flex bg-brand-blue p-3 rounded-xl mb-4 shadow-lg">
                        <Box size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-wide">AssetIQ</h1>
                    <p className="text-gray-400 text-sm mt-1">Smart Resource Management</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                        {isLogin ? 'Welcome back' : 'Create your account'}
                    </h2>

                    {/* Error Message Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-sm">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        required
                                        type="text"
                                        className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue bg-gray-50 focus:bg-white transition"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue bg-gray-50 focus:bg-white transition"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    required
                                    type="password"
                                    className="w-full pl-10 p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue bg-gray-50 focus:bg-white transition"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>



                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 mt-4 bg-brand-blue hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex justify-center items-center gap-2 disabled:bg-blue-400"
                        >
                            {isLoading && <Loader2 size={18} className="animate-spin" />}
                            {isLogin ? 'Sign In' : 'Register Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-brand-blue font-semibold hover:underline"
                        >
                            {isLogin ? 'Register here' : 'Sign in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
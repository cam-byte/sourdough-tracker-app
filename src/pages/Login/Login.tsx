// src/pages/Login/Login.tsx
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wheat, Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

interface LoginProps {
    onLogin: (email: string, password: string) => Promise<void>
    onRegister: (email: string, password: string, name: string) => Promise<void>
    loading?: boolean
    error?: string | null
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, loading = false, error }) => {
    const [isLoginMode, setIsLoginMode] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!isLoginMode) {
            if (formData.password !== formData.confirmPassword) {
                return // Handle password mismatch
            }
            await onRegister(formData.email, formData.password, formData.name)
        } else {
            await onLogin(formData.email, formData.password)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center gap-3 mb-4"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Wheat className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-amber-900">Bread Lab Baker</h1>
                    </motion.div>
                    <p className="text-amber-700">
                        {isLoginMode ? 'Welcome back to your sourdough journey' : 'Start your sourdough adventure'}
                    </p>
                </div>

                {/* Form Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-xl border border-amber-200 p-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Mode Toggle */}
                    <div className="flex bg-amber-50 rounded-xl p-1 mb-6">
                        <button
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                isLoginMode 
                                    ? 'bg-white text-amber-900 shadow-sm' 
                                    : 'text-amber-600 hover:text-amber-800'
                            }`}
                            onClick={() => setIsLoginMode(true)}
                        >
                            Sign In
                        </button>
                        <button
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                !isLoginMode 
                                    ? 'bg-white text-amber-900 shadow-sm' 
                                    : 'text-amber-600 hover:text-amber-800'
                            }`}
                            onClick={() => setIsLoginMode(false)}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name Field (Register only) */}
                        {!isLoginMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="relative">
                                    <Input
                                        label="Name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Your name"
                                        required={!isLoginMode}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Email Field */}
                        <div>
                            <div className="relative">
                                <Input
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                
                                <button
                                    type="button"
                                    className="absolute right-3 bottom-4 text-amber-400 hover:text-amber-600 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Field (Register only) */}
                        {!isLoginMode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="relative">
                                    <Input
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                        placeholder="••••••••"
                                        required={!isLoginMode}
                                    />
                                    
                                    <button
                                        type="button"
                                        className="absolute right-3 bottom-4 text-amber-400 hover:text-amber-600 transition-colors"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            size="lg"
                            className="w-full"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    {isLoginMode ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Decorative Elements */}
                    <div className="mt-8 pt-6 border-t border-amber-200">
                        <div className="text-center text-sm text-amber-600">
                            Ready to track your sourdough starters and perfect your bread-making journey
                        </div>
                    </div>
                </motion.div>

                {/* Decorative bread pattern */}
                <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-amber-300 rounded-full"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
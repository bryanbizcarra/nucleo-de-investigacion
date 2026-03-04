
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeaderBar from '../components/HeaderBar';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;

            navigate('/publicar');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#702d8d] flex items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-30">
                <img src="/imagenes/decoracion2.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="max-w-md w-full relative z-10 flex flex-col gap-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/80 font-bold hover:text-white transition-all self-start"
                >
                    <ArrowLeft size={20} />
                    Volver al inicio
                </button>

                <div className="bg-white rounded-[40px] shadow-2xl p-10 flex flex-col gap-8 border border-white/20">
                    <div className="text-center space-y-2">
                        <h2 className="text-[#702d8d] text-3xl font-black uppercase tracking-tight">Acceso Admin</h2>
                        <p className="text-gray-500 font-medium">Ingresa para gestionar el blog</p>
                    </div>

                    <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#702d8d] uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-[#702d8d]/50" size={20} />
                                <input
                                    required
                                    type="email"
                                    placeholder="admin@nucleo.cl"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#702d8d] uppercase tracking-widest ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-[#702d8d]/50" size={20} />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold animate-shake">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full py-5 bg-[#702d8d] text-white rounded-full font-black text-lg shadow-[0_10px_30px_rgba(112,45,141,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={24} />}
                            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;

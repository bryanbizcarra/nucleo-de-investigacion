import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar: React.FC<{ isBlog: boolean }> = ({ isBlog }) => {
    const navigate = useNavigate();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <nav className="w-full flex justify-center py-4 px-4 md:px-12 relative overflow-hidden z-[100]">
            <div className="max-w-7xl w-full flex items-center justify-between relative z-10">
                {/* Logo Section */}
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
                    <img
                        src={isBlog ? "/imagenes/logo-blanco.webp" : "/imagenes/logo.webp"}
                        alt="Núcleo de Investigación"
                        className="h-20 w-auto object-contain"
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className={`px-10 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm 
                ${isBlog
                                ? 'bg-white text-[#702d8d]'
                                : 'bg-[#702d8d] text-white'
                            }`}
                    >
                        Inicio
                    </button>

                    {session && (
                        <button
                            onClick={handleLogout}
                            className={`flex items-center justify-center p-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-sm 
                ${isBlog
                                    ? 'bg-red-500/90 text-white hover:bg-red-600'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                            title="Cerrar sesión"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

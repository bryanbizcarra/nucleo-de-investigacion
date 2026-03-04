
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC<{ isBlog: boolean }> = ({ isBlog }) => {
    const navigate = useNavigate();

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

                {/* Navigation Button */}
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
            </div>
        </nav>
    );
};

export default Navbar;

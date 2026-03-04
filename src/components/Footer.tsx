
import React from 'react';

interface FooterProps {
    showBorder?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showBorder }) => (
    <div className="w-full flex flex-col items-center gap-8 mt-24 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700 px-4">
        {/* Purple Logo Bar */}
        <div className={`bg-[#702d8d] w-full max-w-5xl rounded-[1.5rem] px-6 md:px-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 lg:gap-32 shadow-sm relative overflow-hidden ${showBorder ? 'border-2 border-white' : ''}`}>
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative z-10 flex flex-col items-center">
                <img src="/imagenes/logo1.webp" alt="Logo 1" className="h-40 md:h-52 w-auto object-contain" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <img src="/imagenes/logo2.webp" alt="Logo 2" className="h-36 md:h-48 w-auto object-contain" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <img src="/imagenes/logo3.webp" alt="Logo 3" className="h-40 md:h-52 w-auto object-contain" />
            </div>
        </div>

        {/* Funding Credits */}
        <p className={`${showBorder ? 'text-white' : 'text-[#5cc8d7]'} text-sm md:text-base text-center font-medium px-4`}>
            Este proyecto ha sido financiado por el proyecto InES “Conocimiento + Género UACh” / INGE220001 / ANID
        </p>
    </div>
);

export default Footer;

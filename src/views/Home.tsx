
import React from 'react';
import { Plus, ArrowRight, Instagram } from 'lucide-react';
import Card from '../components/Card';
import Footer from '../components/Footer';

const Home: React.FC<{ onNavigate: (target: string) => void }> = ({ onNavigate }) => (
    <div className="max-w-7xl w-full flex flex-col items-center gap-12 animate-in fade-in duration-700 px-4 md:px-0 relative">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            <div className="lg:row-span-2">
                <div className="relative p-10 rounded-[2.5rem] bg-[#dcdde1] flex flex-col justify-between h-full min-h-[460px] md:min-h-[504px] shadow-sm relative group">
                    {/* Research Icon */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center border-4 border-[#f8f8f8] shadow-lg overflow-hidden">
                            <img
                                src="/imagenes/icono-investigacion.webp"
                                alt="Icono Investigación"
                                className="w-full h-full object-contain p-4"
                            />
                        </div>
                    </div>

                    <div className="mt-20 md:mt-24 relative z-10">
                        <h1 className="text-3xl font-extrabold text-[#2d2d2d] leading-[1.1] max-w-[280px]">
                            Núcleo de Investigación Interdisciplinar en Género, Espacio y Corporeidad
                        </h1>
                    </div>
                    <div className="flex justify-start relative z-10">
                        <button className="w-14 h-14 rounded-full border-2 border-[#702d8d] flex items-center justify-center text-[#702d8d] hover:bg-[#702d8d] hover:text-white transition-all group">
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-rows-2 gap-6 lg:row-span-2">
                <Card title="Ejes de Desarrollo y Objetivos" bgColor="bg-[#702d8d]" textColor="text-white" onClick={() => onNavigate('/details')} />
                <Card title="Novedades y blogs" bgColor="bg-[#dcdde1]" textColor="text-[#2d2d2d]" onClick={() => onNavigate('/blog')} />
            </div>
            <div className="grid grid-rows-2 gap-6 lg:row-span-2">
                <Card title="Archivos" bgColor="bg-[#dcdde1]" textColor="text-[#2d2d2d]" />
                <Card title="Fotografías del proyecto" bgColor="bg-[#5cc8d7]" textColor="text-white" />
            </div>
            <div className="flex flex-col gap-6 lg:row-span-2">
                <Card title="Instagram" bgColor="bg-[#702d8d]" textColor="text-white" icon={<Instagram size={36} className="text-white" />} className="h-[160px] min-h-[160px]" />
                <div onClick={() => onNavigate('/about')} className="relative group overflow-hidden rounded-[2rem] flex-1 min-h-[480px] shadow-sm cursor-pointer transition-transform hover:scale-[1.02]">
                    <img src="/imagenes/fondo-mujeres-home.jpg" alt="Sobre nosotras" className="absolute inset-0 w-full h-full object-cover object-center grayscale brightness-100 transition-transform duration-700 group-hover:scale-125 scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-6 right-6"><div className="bg-[#5cc8d7]/90 p-1.5 rounded-full border border-white/20 backdrop-blur-sm"><Plus size={20} className="text-white" /></div></div>
                    <div className="absolute bottom-8 left-8 pr-4"><h3 className="text-2xl font-bold text-white leading-tight">Sobre nosotras</h3></div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default Home;

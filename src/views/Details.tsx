
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';

const Details: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden bg-[#f8f8f8]">
            <div className="absolute top-0 right-0 translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion3.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="absolute top-[60%] left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="max-w-7xl w-full px-4 md:px-12 flex flex-col relative z-10 py-24">
                {/* Row 1: Ejes */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mb-32">
                    <div className="lg:col-span-3 flex justify-start">
                        <div className="relative w-full aspect-[4/7] max-w-[260px] rounded-[1.5rem] bg-[#702d8d] p-8 pb-10 flex flex-col justify-end text-white overflow-hidden shadow-sm group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl font-bold leading-tight">Ejes de <br />Desarrollo</h3>
                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6 space-y-8 pt-4">
                        <h2 className="text-3xl font-black text-[#702d8d] tracking-tight">Ejes de Desarrollo</h2>
                        <div className="text-[#555] text-lg leading-[1.8] space-y-6 font-medium">
                            <p>
                                El “Núcleo de Investigación Interdisciplinar en Género, Espacio y Corporeidad (NII-GEC)” se plantea como un espacio colectivo para la producción e intercambio de saberes entre la academia y los territorios, con un enfoque crítico en las relaciones entre cuerpo, espacio y estructuras sociales desde una perspectiva de género interseccional. Parte del recognition del espacio como una construcción social e histórica, en constante interacción con el cuerpo. Desde esta mirada, el núcleo analiza cómo las configuraciones espaciales afectan la experiencia cotidiana de los cuerpos, especialmente aquellos excluidos o subalternizados por razones de género, raza, clase, capacidad, etnicidad u orientación sexual.
                            </p>
                        </div>
                    </div>
                    <div className="hidden lg:block lg:col-span-3"></div>
                </div>

                {/* Row 2: General */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start mb-32">
                    <div className="hidden lg:block lg:col-span-3"></div>
                    <div className="lg:col-span-6 space-y-8 pt-4">
                        <h2 className="text-3xl font-black text-[#5cc8d7] tracking-tight">Objetivo general</h2>
                        <p className="text-[#555] text-lg leading-[1.8] font-medium">
                            Consolidar al Núcleo Interdisciplinar de Investigación en Género, Espacio y Corporeidad (NII-GEC) como un espacio colectivo de co-producción de conocimientos, desarrollo, innovación y creación artística, orientado al análisis crítico de las relaciones entre los cuerpos, los espacios y las diferentes estructuras sociales desde una perspectiva de género interseccional, contribuyendo a la promoción de la justicia social, espacial, territorial y corporal.
                        </p>
                    </div>
                    <div className="lg:col-span-3 flex justify-end">
                        <div className="relative w-full aspect-[4/7] max-w-[260px] rounded-[1.5rem] bg-[#5cc8d7] p-8 pb-10 flex flex-col justify-end text-white overflow-hidden shadow-sm group">
                            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-2xl font-bold leading-tight">Objetivos</h3>
                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:scale-110">
                                    <ArrowLeft size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Row 3: Específicos */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                    <div className="lg:col-span-3 flex justify-start">
                        <div className="relative w-full aspect-[4/7] max-w-[260px] rounded-[1.5rem] overflow-hidden shadow-sm group">
                            <img
                                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                                className="absolute inset-0 w-full h-full object-cover grayscale brightness-75 transition-transform duration-700 group-hover:scale-105"
                                alt="Objetivos"
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative z-10 h-full p-8 pb-10 flex flex-col justify-end text-white">
                                <h3 className="text-2xl font-bold leading-tight mb-6">Objetivos</h3>
                                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                                    <ArrowRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-6 space-y-10 pt-4">
                        <h2 className="text-3xl font-black text-[#702d8d] tracking-tight">Objetivos específicos</h2>
                        <div className="space-y-10 text-[#555] text-lg leading-[1.7] font-medium">
                            <div className="flex gap-4 items-start">
                                <span className="text-[#702d8d] font-black shrink-0 text-xl pt-0.5">OE1.</span>
                                <p>Producir investigaciones interdisciplinarias de manera colaborativa que aborden críticamente las relaciones entre cuerpo, espacio y género desde enfoques interseccionales.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-[#702d8d] font-black shrink-0 text-xl pt-0.5">OE2.</span>
                                <p>Diseñar e implementar instancias de creación artística y transferencia de conocimientos que vinculen saberes intra-extra núcleo con la comunidad universitaria y local, nacional e internacional.</p>
                            </div>
                            <div className="flex gap-4 items-start">
                                <span className="text-[#702d8d] font-black shrink-0 text-xl pt-0.5">OE3.</span>
                                <p>Fomentar y articular instancias de intercambio y co-creación de conocimientos y saberes en torno a la intersección NII-GEC en red con organizaciones comunitarias, instituciones públicas y espacios académicos nacionales e internacionales.</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden lg:block lg:col-span-3"></div>
                </div>

                <Footer />
            </div>
            <div className="w-full relative z-20">
                <BackButton onClick={() => navigate('/')} />
            </div>
        </div>
    );
};

export default Details;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface Certificate {
    id: string;
    title: string;
    url: string;
}

const Archives: React.FC = () => {
    const navigate = useNavigate();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('certificates')
                    .select('id, title, url')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCertificates(data || []);
            } catch (error) {
                console.error('Error fetching certificates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#5cc8d7] animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-white flex flex-col items-center animate-in fade-in duration-700 overflow-x-hidden relative">
            
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>
            <div className="absolute bottom-0 right-0 translate-x-1/2 w-64 md:w-[500px] pointer-events-none opacity-40 z-0">
                <img src="/imagenes/decoracion1.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="max-w-7xl w-full flex flex-col gap-8 relative px-4 md:px-0 z-20 py-12 md:py-24">
                
                {/* Text Content */}
                <div className="max-w-4xl space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tight">
                        Biblioteca del proyecto.
                    </h1>
                    
                    <div className="inline-block mt-4 mb-8">
                        <span className="bg-[#5cc8d7] text-white px-6 py-2 rounded-full font-black tracking-wide text-sm md:text-base">
                            CERTIFICADOS
                        </span>
                    </div>
                </div>

                {/* Certificates List */}
                <div className="mt-8 pb-12 w-full max-w-4xl">
                    {certificates.length > 0 ? (
                        <ul className="space-y-4 list-none pl-0">
                            {certificates.map((cert) => (
                                <li key={cert.id} className="flex items-start gap-2">
                                    <span className="text-black text-xl mt-0.5">•</span>
                                    <a 
                                        href={cert.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-black hover:text-[#5cc8d7] hover:underline font-medium text-base md:text-lg transition-colors cursor-pointer"
                                    >
                                        {cert.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 font-medium">No hay certificados disponibles en este momento.</p>
                    )}
                </div>

                <Footer showBorder={true} />
            </div>
            
            <div className="w-full relative z-10 pb-12">
                <BackButton onClick={() => navigate('/')} />
            </div>
        </div>
    );
};

export default Archives;

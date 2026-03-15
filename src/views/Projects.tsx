import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface Project {
    id: string;
    title: string;
    slug: string;
    image_url: string;
    profiles: {
        full_name: string;
    } | null;
}

const ProjectCard: React.FC<{ project: Project; active?: boolean }> = ({ project, active }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/fotografias/${project.slug}`)}
            className={`relative h-[420px] md:h-[480px] w-[280px] md:w-full shrink-0 snap-center rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 hover:ring-4 hover:ring-[#702d8d]/30 hover:scale-105 ${active ? 'md:ring-4 md:ring-[#702d8d]/30 md:scale-105' : 'opacity-90 md:opacity-80 hover:opacity-100'}`}
        >
            <img
                src={project.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800"}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#702d8d]/90 via-[#702d8d]/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
                <h4 className="text-white font-black text-xl leading-tight mb-2 uppercase tracking-tight">
                    {project.title}
                </h4>
                <p className="text-white/80 text-sm font-medium">
                    {project.profiles?.full_name || 'Autor desconocido'}
                </p>
            </div>
        </div>
    );
};

const Projects: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('id, title, slug, image_url, profiles(full_name)')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProjects(data as any);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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

            <div className="max-w-7xl w-full flex flex-col gap-10 md:gap-12 relative px-4 md:px-0 z-20 py-6 md:py-12">
                
                {/* Blue Banner */}
                <div className="w-full bg-[#5cc8d7] rounded-2xl md:rounded-[40px] p-6 md:p-8 flex items-center justify-between shadow-sm">
                    <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">Fotografías del proyecto</h2>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white flex items-center justify-center text-white">
                        <ArrowDown size={24} />
                    </div>
                </div>

                {/* Text Content */}
                <div className="max-w-3xl space-y-6 md:space-y-8 mt-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#702d8d] leading-tight tracking-tight">
                        Proyectos y experiencias<br />del núcleo.
                    </h1>
                    <p className="text-[#702d8d]/90 text-base md:text-lg leading-relaxed font-medium">
                        Una selección de proyectos, talleres y charlas en los que hemos participado. 
                        En cada carrusel podrás explorar distintas iniciativas, conocer su contexto y 
                        descubrir parte del proceso creativo, las ideas desarrolladas y los resultados 
                        de cada experiencia.
                    </p>
                </div>

                {/* Projects Carousel */}
                <div className="mt-4 pb-12">
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory scroll-smooth no-scrollbar">
                        {projects.length > 0 ? (
                            projects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} active={index === 2} />
                            ))
                        ) : (
                            <p className="text-[#702d8d]/60 font-medium">No hay fotografías disponibles todavía.</p>
                        )}
                    </div>
                    {projects.length > 0 && (
                        <div className="flex gap-4 mt-8">
                            <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#702d8d]/50 flex items-center justify-center text-[#702d8d] hover:bg-[#702d8d] hover:text-white transition-all">
                                <ChevronLeft size={28} />
                            </button>
                            <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-[#702d8d]/50 flex items-center justify-center text-[#702d8d] hover:bg-[#702d8d] hover:text-white transition-all">
                                <ChevronRight size={28} />
                            </button>
                        </div>
                    )}
                </div>

                <Footer showBorder={true} />
            </div>
            
            <div className="w-full relative z-10 pb-12">
                <BackButton onClick={() => navigate('/')} />
            </div>
            
            <style dangerouslySetInnerHTML={{
                __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
        </div>
    );
};

export default Projects;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, User, Calendar, Tag, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeaderBar from '../components/HeaderBar';
import Footer from '../components/Footer';

interface PostDefinition {
    id: string;
    title: string;
    slug: string;
    content: string;
    image_url: string;
    created_at: string;
    profiles: {
        full_name: string;
    } | null;
    categories: {
        name: string;
    } | null;
    author_id: string;
}

const BlogPost: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<PostDefinition | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setCurrentUserId(session.user.id);
            }
        };
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const { data, error: fetchError } = await supabase
                    .from('posts')
                    .select('id, title, slug, content, image_url, created_at, author_id, profiles(full_name), categories(name)')
                    .eq('slug', slug)
                    .eq('status', 'published')
                    .single();

                if (fetchError) throw fetchError;
                setPost(data as any);
            } catch (err: any) {
                console.error('Error fetching post:', err);
                setError('No se pudo encontrar el artículo.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            setLoading(true);
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', post?.id);

            if (deleteError) throw deleteError;

            alert('Post eliminado correctamente.');
            navigate('/blog');
        } catch (err: any) {
            console.error('Error deleting post:', err);
            alert('Error al eliminar el post: ' + err.message);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full min-h-screen bg-[#f8f8f8] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#702d8d] animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="w-full min-h-screen bg-[#f8f8f8] flex flex-col items-center justify-center gap-6">
                <h2 className="text-3xl font-black text-[#702d8d]">{error || 'Artículo no encontrado'}</h2>
                <button
                    onClick={() => navigate('/blog')}
                    className="px-8 py-3 bg-[#702d8d] text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                    Volver al Blog
                </button>
            </div>
        );
    }

    const formattedDate = new Date(post.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="w-full min-h-screen bg-[#f8f8f8] flex flex-col items-center animate-in fade-in duration-700">
            {/* Hero Image Section */}
            <div className="w-full h-[40vh] md:h-[60vh] relative">
                <img
                    src={post.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f8f8f8] via-transparent to-black/30"></div>

                <button
                    onClick={() => navigate('/blog')}
                    className="absolute top-8 left-4 md:left-12 flex items-center gap-2 text-white font-bold bg-black/20 px-6 py-3 rounded-full backdrop-blur-md hover:bg-black/40 transition-all z-10"
                >
                    <ArrowLeft size={20} />
                    Volver
                </button>

                {currentUserId === post.author_id && (
                    <div className="absolute top-8 right-4 md:right-12 flex items-center gap-4 z-10">
                        <button
                            onClick={() => navigate(`/editar/${post.slug}`)}
                            className="flex items-center gap-2 text-white font-bold bg-blue-600/80 px-4 py-2 rounded-full backdrop-blur-md hover:bg-blue-600 transition-all shadow-lg"
                        >
                            <Edit size={18} />
                            Editar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 text-white font-bold bg-red-600/80 px-4 py-2 rounded-full backdrop-blur-md hover:bg-red-600 transition-all shadow-lg"
                        >
                            <Trash2 size={18} />
                            Eliminar
                        </button>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="max-w-4xl w-full px-4 md:px-0 -mt-20 md:-mt-32 relative z-20 flex flex-col gap-12 pb-16">
                <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-16 flex flex-col gap-8">
                    {/* Header Info */}
                    <div className="flex flex-col gap-6 border-b border-[#f0f0f0] pb-8">
                        <div className="flex flex-wrap gap-4 items-center text-sm font-bold text-[#702d8d] uppercase tracking-wider">
                            {post.categories?.name && (
                                <div className="flex items-center gap-1.5 bg-[#702d8d]/10 px-4 py-2 rounded-full">
                                    <Tag size={16} />
                                    {post.categories.name}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 opacity-70">
                                <Calendar size={16} />
                                {formattedDate}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex items-center gap-3 text-[#702d8d] font-bold mt-2">
                            <div className="w-10 h-10 rounded-full bg-[#702d8d]/10 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <span>{post.profiles?.full_name || 'Autor Desconocido'}</span>
                        </div>
                    </div>

                    {/* Body Text */}
                    <div className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed font-light whitespace-pre-wrap">
                        {post.content}
                    </div>
                </div>

                <Footer showBorder={false} />
            </div>
        </div>
    );
};

export default BlogPost;

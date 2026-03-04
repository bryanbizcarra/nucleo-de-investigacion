
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import HeaderBar from '../components/HeaderBar';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface Post {
    id: string;
    title: string;
    slug: string;
    image_url: string;
    profiles: {
        full_name: string;
    } | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    posts_count?: number;
}

const BlogCard: React.FC<{ post: Post; active?: boolean }> = ({ post, active }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/blog/${post.slug}`)}
            className={`relative h-[420px] md:h-[480px] w-[280px] md:w-full shrink-0 snap-center rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 ${active ? 'md:ring-4 md:ring-white/30 md:scale-105' : 'opacity-90 md:opacity-80'}`}
        >
            <img
                src={post.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800"}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#702d8d]/90 via-[#702d8d]/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
                <h4 className="text-white font-black text-xl leading-tight mb-2 uppercase tracking-tight">
                    {post.title}
                </h4>
                <p className="text-white/80 text-sm font-medium">
                    {post.profiles?.full_name || 'Autor desconocido'}
                </p>
            </div>
        </div>
    );
};

const ArchiveCard: React.FC<{ category: Category; onClick: () => void }> = ({ category, onClick }) => (
    <div
        onClick={onClick}
        className="relative h-[240px] w-[260px] md:w-full shrink-0 snap-center overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
    >
        <img
            src={category.image_url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-[#702d8d]/50 mix-blend-multiply transition-opacity group-hover:opacity-70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#702d8d]/90 via-[#702d8d]/20 to-transparent"></div>

        <div className="absolute bottom-6 left-6 flex flex-col gap-2 items-start">
            <h4 className="text-white font-black text-2xl tracking-tight leading-none">
                {category.name}
            </h4>
            <div className="bg-white px-3 py-1 rounded-full shadow-md">
                <span className="text-[#702d8d] text-[10px] md:text-xs font-black uppercase whitespace-nowrap">
                    {category.posts_count || 0} {category.posts_count === 1 ? 'Post' : 'Posts'}
                </span>
            </div>
        </div>
    </div>
);

const Blog: React.FC = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryPosts, setCategoryPosts] = useState<Post[]>([]);
    const [loadingCategoryPosts, setLoadingCategoryPosts] = useState(false);

    const openCategoryModal = async (category: Category) => {
        setSelectedCategory(category);
        setLoadingCategoryPosts(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('id, title, slug, image_url, profiles(full_name)')
                .eq('category_id', category.id)
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCategoryPosts(data as any);
        } catch (error) {
            console.error('Error fetching category posts:', error);
        } finally {
            setLoadingCategoryPosts(false);
        }
    };

    const closeCategoryModal = () => {
        setSelectedCategory(null);
        setCategoryPosts([]);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch posts with author info
                const { data: postsData, error: postsError } = await supabase
                    .from('posts')
                    .select('id, title, slug, image_url, profiles(full_name)')
                    .eq('status', 'published')
                    .order('created_at', { ascending: false });

                if (postsError) throw postsError;
                setPosts(postsData as any);

                // Fetch categories with post counts
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('categories')
                    .select('id, name, slug');

                if (categoriesError) throw categoriesError;

                // Get counts for each category
                const categoriesWithCounts = await Promise.all(
                    categoriesData.map(async (cat) => {
                        const { count, error: countError } = await supabase
                            .from('posts')
                            .select('*', { count: 'exact', head: true })
                            .eq('category_id', cat.id)
                            .eq('status', 'published');

                        // Also get the featured image of the latest post for this category
                        const { data: latestPost } = await supabase
                            .from('posts')
                            .select('image_url')
                            .eq('category_id', cat.id)
                            .eq('status', 'published')
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .maybeSingle();

                        return {
                            ...cat,
                            posts_count: count || 0,
                            image_url: latestPost?.image_url
                        };
                    })
                );

                setCategories(categoriesWithCounts);
            } catch (error) {
                console.error('Error fetching blog data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen bg-[#702d8d] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#702d8d] flex flex-col items-center animate-in fade-in duration-700 overflow-x-hidden relative">
            <div className="absolute top-0 left-0 -translate-x-1/2 w-64 md:w-[500px] pointer-events-none z-10">
                <img src="/imagenes/decoracion2.webp" alt="" className="w-full h-auto" />
            </div>

            <div className="absolute bottom-0 right-0 translate-x-1/2 w-64 md:w-[500px] pointer-events-none z-10">
                <img src="/imagenes/decoracion2.webp" alt="" className="w-full h-auto" />
            </div>
            <div className="max-w-7xl w-full flex flex-col gap-10 md:gap-12 relative px-4 md:px-0 z-20 py-12">
                <HeaderBar title="Novedades y Blog" />

                <div className="max-w-3xl space-y-6 md:space-y-8 mt-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                        Un espacio con crítica y enfoque transformador
                    </h1>
                    <p className="text-white/90 text-base md:text-lg leading-relaxed font-light">
                        Un espacio que invita a cuestionar las normas, dinámicas y estructuras que moldean nuestros cuerpos y territorios.
                    </p>
                </div>

                <div className="mt-4">
                    <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory no-scrollbar scroll-smooth">
                        {posts.length > 0 ? (
                            posts.map((post, index) => (
                                <BlogCard key={post.id} post={post} active={index === 2} />
                            ))
                        ) : (
                            <p className="text-white/60">No hay publicaciones disponibles.</p>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#702d8d] transition-all">
                        <ChevronLeft size={28} />
                    </button>
                    <button className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#702d8d] transition-all">
                        <ChevronRight size={28} />
                    </button>
                </div>

                <div className="mt-12 space-y-8">
                    <HeaderBar title="Archivos" />
                    <div className="relative group">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 hidden md:flex">
                            <button className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white bg-[#702d8d] hover:bg-white hover:text-[#702d8d] transition-all shadow-lg">
                                <ChevronLeft size={24} />
                            </button>
                        </div>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 hidden md:flex">
                            <button className="w-12 h-12 rounded-full border border-white/40 flex items-center justify-center text-white bg-[#702d8d] hover:bg-white hover:text-[#702d8d] transition-all shadow-lg">
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        <div className="flex md:grid md:grid-cols-4 gap-0.5 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar border-t border-b border-white/10">
                            {categories.map((cat) => (
                                <ArchiveCard key={cat.id} category={cat} onClick={() => openCategoryModal(cat)} />
                            ))}
                        </div>
                    </div>
                </div>
                <Footer showBorder={true} />
            </div>
            <div className="w-full mt-12 relative z-10">
                <BackButton onClick={() => navigate('/')} />
            </div>

            {/* Category Modal */}
            {selectedCategory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-[#702d8d]/80 backdrop-blur-sm" onClick={closeCategoryModal}></div>
                    <div className="relative bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#f0f0f0]">
                            <div>
                                <h2 className="text-3xl font-black text-[#702d8d] uppercase tracking-tight">
                                    {selectedCategory.name}
                                </h2>
                                <p className="text-gray-500 font-medium mt-1">
                                    {categoryPosts.length} {categoryPosts.length === 1 ? 'publicación' : 'publicaciones'}
                                </p>
                            </div>
                            <button
                                onClick={closeCategoryModal}
                                className="w-12 h-12 flex items-center justify-center bg-[#f8f8f8] text-[#702d8d] rounded-full hover:bg-[#702d8d] hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 overflow-y-auto bg-[#f8f8f8] flex-1">
                            {loadingCategoryPosts ? (
                                <div className="w-full py-20 flex justify-center">
                                    <Loader2 className="w-10 h-10 text-[#702d8d] animate-spin" />
                                </div>
                            ) : categoryPosts.length > 0 ? (
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categoryPosts.map(post => (
                                        <div
                                            key={post.id}
                                            onClick={() => navigate(`/blog/${post.slug}`)}
                                            className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col border border-[#702d8d]/5"
                                        >
                                            <div className="h-48 overflow-hidden relative p-2 pb-0">
                                                <img
                                                    src={post.image_url || "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80"}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-2 rounded-[24px] bg-[#702d8d]/0 group-hover:bg-[#702d8d]/20 transition-colors pointer-events-none"></div>
                                            </div>
                                            <div className="p-6 flex-1 flex flex-col">
                                                <h3 className="font-black text-[#1a1a1a] text-xl mb-3 line-clamp-3 leading-tight group-hover:text-[#702d8d] transition-colors">
                                                    {post.title}
                                                </h3>
                                                <p className="text-[#a0a0a0] text-sm font-medium mt-auto">
                                                    {post.profiles?.full_name || 'Autor desconocido'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full py-20 flex justify-center text-center">
                                    <p className="text-gray-500 font-medium text-lg">No hay publicaciones en esta categoría por el momento.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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

export default Blog;


import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Loader2, Save, ArrowLeft, Image as ImageIcon, Edit, Trash2, Plus, List } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeaderBar from '../components/HeaderBar';
import Footer from '../components/Footer';

interface Category {
    id: string;
    name: string;
}

interface PostDefinition {
    id: string;
    title: string;
    slug: string;
    created_at: string;
    status: string;
}

const PublishPost: React.FC = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetchingPost, setFetchingPost] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [postId, setPostId] = useState<string | null>(null);
    const [userPosts, setUserPosts] = useState<PostDefinition[]>([]);
    const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        status: 'published' as 'published' | 'draft'
    });

    useEffect(() => {
        fetchCategories();
        if (slug) {
            setViewMode('form');
            fetchPostData();
        } else {
            // Si no hay slug, por defecto mostramos la lista si hay posts, o el form si queremos crear
            fetchUserPosts();
        }
    }, [slug]);

    const fetchUserPosts = async () => {
        setLoadingPosts(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('posts')
                .select('id, title, slug, created_at, status')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUserPosts(data || []);

            // Si no hay slug y elegimos entrar a la /publicar, mostramos la lista inicialmente
            if (!slug) {
                setViewMode('list');
            }
        } catch (error) {
            console.error('Error fetching user posts:', error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchPostData = async () => {
        setFetchingPost(true);
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;

            if (data) {
                setPostId(data.id);
                setFormData({
                    title: data.title,
                    excerpt: data.excerpt,
                    content: data.content,
                    category_id: data.category_id,
                    status: data.status as 'published' | 'draft'
                });
                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
            }
        } catch (error) {
            console.error('Error fetching post data:', error);
            alert('No se pudo cargar la información del post.');
            navigate('/blog');
        } finally {
            setFetchingPost(false);
        }
    };

    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('id, name');
        if (error) console.error('Error fetching categories:', error);
        else setCategories(data || []);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, imageFile);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            return null;
        }

        const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleDeletePost = async (postIdToDelete: string) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este post? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            setLoadingPosts(true);
            const { error: deleteError } = await supabase
                .from('posts')
                .delete()
                .eq('id', postIdToDelete);

            if (deleteError) throw deleteError;

            alert('Post eliminado correctamente.');
            fetchUserPosts();
        } catch (err: any) {
            console.error('Error deleting post:', err);
            alert('Error al eliminar el post: ' + err.message);
            setLoadingPosts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadImage() || '';
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No se encontró sesión de usuario');

            const postSlug = formData.title
                .toLowerCase()
                .replace(/[^a-záéíóúñ0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const postData: any = {
                title: formData.title,
                slug: postSlug,
                excerpt: formData.excerpt,
                content: formData.content,
                category_id: formData.category_id,
                status: formData.status,
            };

            if (imageUrl) {
                postData.image_url = imageUrl;
            }

            let error;
            if (postId) {
                // Update existing post
                const { error: updateError } = await supabase
                    .from('posts')
                    .update(postData)
                    .eq('id', postId);
                error = updateError;
            } else {
                // Insert new post
                postData.author_id = user.id;
                const { error: insertError } = await supabase
                    .from('posts')
                    .insert(postData);
                error = insertError;
            }

            if (error) throw error;

            alert(`¡Post ${postId ? 'actualizado' : 'publicado'} con éxito!`);
            if (postId) {
                navigate('/blog');
            } else {
                fetchUserPosts();
                setViewMode('list');
                // Reset form
                setFormData({ title: '', excerpt: '', content: '', category_id: '', status: 'published' });
                setImageFile(null);
                setImagePreview(null);
            }
        } catch (error: any) {
            console.error('Error publishing post:', error);
            alert('Error al publicar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setPostId(null);
        setFormData({ title: '', excerpt: '', content: '', category_id: '', status: 'published' });
        setImageFile(null);
        setImagePreview(null);
        setViewMode('form');
        navigate('/publicar');
    };

    return (
        <div className="w-full min-h-screen bg-[#f8f8f8] flex flex-col items-center py-12 px-4 animate-in fade-in duration-700">
            {fetchingPost ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#702d8d] animate-spin" />
                </div>
            ) : (
                <div className="max-w-5xl w-full flex flex-col gap-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <button
                            onClick={() => navigate('/blog')}
                            className="flex items-center gap-2 text-[#702d8d] font-bold hover:translate-x-[-4px] transition-transform w-full md:w-auto"
                        >
                            <ArrowLeft size={20} />
                            Volver al Blog
                        </button>
                        <HeaderBar title="Gestión de Publicaciones" />

                        <div className="flex bg-white rounded-full shadow-sm p-1 border border-[#702d8d]/10 w-full md:w-auto">
                            <button
                                onClick={() => viewMode !== 'list' && fetchUserPosts()}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-[#702d8d] text-white shadow-md' : 'text-[#702d8d] hover:bg-[#702d8d]/5'}`}
                            >
                                <List size={16} />
                                Mis Posts
                            </button>
                            <button
                                onClick={handleCreateNew}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'form' && !postId ? 'bg-[#702d8d] text-white shadow-md' : 'text-[#702d8d] hover:bg-[#702d8d]/5'}`}
                            >
                                <Plus size={16} />
                                Nuevo
                            </button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12 border border-[#702d8d]/10 min-h-[50vh]">
                            <h2 className="text-2xl font-black text-[#702d8d] mb-8">Mis Publicaciones</h2>

                            {loadingPosts ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-10 h-10 text-[#702d8d] animate-spin" />
                                </div>
                            ) : userPosts.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-[#702d8d]/10 flex items-center justify-center text-[#702d8d]">
                                        <List size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Aún no tienes publicaciones</h3>
                                        <p className="text-gray-500">Crea tu primer post para compartir tu investigación con el mundo.</p>
                                    </div>
                                    <button
                                        onClick={handleCreateNew}
                                        className="px-8 py-3 bg-[#702d8d] text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mt-4"
                                    >
                                        <Plus size={20} />
                                        Crear mi primer post
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {userPosts.map(post => (
                                        <div key={post.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-[#f0f0f0] hover:border-[#702d8d]/30 transition-colors bg-[#f8f8f8]/50">
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-lg font-bold text-[#1a1a1a] line-clamp-1">{post.title}</h3>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-500">
                                                        {new Date(post.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => navigate(`/editar/${post.slug}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] rounded-xl text-gray-700 font-bold hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] rounded-xl text-gray-700 font-bold hover:text-red-600 hover:border-red-200 transition-colors shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12 flex flex-col gap-8 border border-[#702d8d]/10">

                            <div className="flex items-center gap-3 mb-2">
                                {postId && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-widest">
                                        Modo Edición
                                    </span>
                                )}
                                <h2 className="text-2xl font-black text-[#702d8d]">
                                    {postId ? "Actualizar Información" : "Detalles del Nuevo Post"}
                                </h2>
                            </div>

                            {/* Image Upload Area */}
                            <div className="w-full">
                                <label className="text-sm font-black text-[#702d8d] uppercase tracking-wider mb-3 block">
                                    Imagen Destacada
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative h-64 md:h-80 w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${imagePreview ? 'border-transparent' : 'border-[#702d8d]/20 bg-[#702d8d]/5 hover:bg-[#702d8d]/10'}`}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                                                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-[#702d8d] shadow-lg hover:bg-white"
                                            >
                                                <X size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#702d8d] shadow-sm">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-bold text-[#702d8d] text-lg">Haz clic para subir una imagen</p>
                                                <p className="text-[#a0a0a0] text-sm">PNG, JPG o WebP (Recomendado 1200x800px)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-black text-[#702d8d] uppercase tracking-wider block">
                                        Título del Post
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Escribe un título impactante..."
                                        className="w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-black text-[#702d8d] uppercase tracking-wider block">
                                        Categoría
                                    </label>
                                    <select
                                        required
                                        className="w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium appearance-none"
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-[#702d8d] uppercase tracking-wider block">
                                    Extracto (Breve resumen)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Una breve descripción que invite a leer..."
                                    className="w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium resize-none"
                                    value={formData.excerpt}
                                    onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-black text-[#702d8d] uppercase tracking-wider block">
                                    Contenido del Post
                                </label>
                                <textarea
                                    required
                                    rows={10}
                                    placeholder="Escribe aquí toda la información..."
                                    className="w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 focus:ring-[#702d8d] font-medium resize-y"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-[#f0f0f0]">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                                        className={`px-8 py-3 rounded-full font-bold transition-all ${formData.status === 'draft' ? 'bg-[#702d8d] text-white shadow-lg' : 'bg-[#e0e0e0] text-[#707070] hover:bg-[#d0d0d0]'}`}
                                    >
                                        Borrador
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'published' })}
                                        className={`px-8 py-3 rounded-full font-bold transition-all ${formData.status === 'published' ? 'bg-[#702d8d] text-white shadow-lg' : 'bg-[#e0e0e0] text-[#707070] hover:bg-[#d0d0d0]'}`}
                                    >
                                        Publicar
                                    </button>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="w-full md:w-auto px-12 py-5 bg-[#702d8d] text-white rounded-full font-black text-lg shadow-[0_10px_30px_rgba(112,45,141,0.3)] hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            PROCESANDO...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={24} />
                                            GUARDAR PUBLICACIÓN
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    <Footer showBorder={false} />
                </div>
            )}
        </div>
    );
};

export default PublishPost;

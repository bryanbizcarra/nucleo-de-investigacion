import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, Loader2, Save, ArrowLeft, Image as ImageIcon, Edit, Trash2, Plus, List, FileText, Camera, FileArchive, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import HeaderBar from '../components/HeaderBar';
import Footer from '../components/Footer';

interface Category {
    id: string;
    name: string;
}

interface ItemDefinition {
    id: string;
    title: string;
    slug: string;
    created_at: string;
    status: string;
    type: 'post' | 'project' | 'certificate';
}

const PublishPost: React.FC = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [itemId, setItemId] = useState<string | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
    
    // UI states
    const [viewMode, setViewMode] = useState<'form' | 'list'>('form');
    const [itemType, setItemType] = useState<'post' | 'project' | 'certificate'>('post');
    const [userItems, setUserItems] = useState<ItemDefinition[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        url: '',
        status: 'published' as 'published' | 'draft'
    });

    useEffect(() => {
        fetchCategories();
        if (slug) {
            setViewMode('form');
            fetchItemData(slug);
        } else {
            fetchUserItems(itemType);
        }
    }, [slug]);

    useEffect(() => {
        if (!slug && viewMode === 'list') {
            fetchUserItems(itemType);
        }
    }, [itemType, viewMode, slug]);

    const fetchUserItems = async (type: 'post' | 'project' | 'certificate') => {
        setLoadingItems(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const tableName = type === 'post' ? 'posts' : type === 'project' ? 'projects' : 'certificates';
            let query = supabase.from(tableName).select('id, title, slug, created_at, status').order('created_at', { ascending: false });
            
            if (type === 'project' || type === 'certificate') {
                query = query.eq('author_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            setUserItems((data || []).map((item: any) => ({ ...item, type })));

            if (!slug && viewMode !== 'list') {
                setViewMode('list');
            }
        } catch (error) {
            console.error('Error fetching user items:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const fetchItemData = async (slugToFetch: string) => {
        setFetchingData(true);
        try {
            // Try post first
            let { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slugToFetch)
                .single();

            let foundType: 'post' | 'project' | 'certificate' = 'post';

            if (error || !data) {
                // Try project
                const { data: projData, error: projError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('slug', slugToFetch)
                    .single();
                
                if (projError || !projData) {
                    // Try certificate
                    const { data: certData, error: certError } = await supabase
                        .from('certificates')
                        .select('*')
                        .eq('slug', slugToFetch)
                        .single();
                        
                    if (certError) throw certError;
                    data = certData;
                    foundType = 'certificate';
                } else {
                    data = projData;
                    foundType = 'project';
                }
            }

            if (data) {
                setItemId(data.id);
                setItemType(foundType);
                setFormData({
                    title: data.title,
                    excerpt: data.excerpt || '',
                    content: data.content || '',
                    category_id: data.category_id || '',
                    url: data.url || '',
                    status: data.status as 'published' | 'draft'
                });
                if (data.image_url) {
                    setImagePreview(data.image_url);
                }
                if (foundType === 'project' && data.gallery) {
                    setGalleryUrls(data.gallery || []);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('No se pudo cargar la información.');
            navigate('/publicar');
        } finally {
            setFetchingData(false);
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

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setGalleryFiles(prev => [...prev, ...files]);
        }
    };

    const removeGalleryImage = (index: number, isExisting: boolean) => {
        if (isExisting) {
            setGalleryUrls(prev => prev.filter((_, i) => i !== index));
        } else {
            setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        }
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return null;

        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${itemType}s/${fileName}`; // posts/ or projects/

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

    const handleDeleteItem = async (idToDelete: string, type: 'post' | 'project' | 'certificate') => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar est${type === 'post' ? 'e post' : type === 'project' ? 'e proyecto' : 'e certificado'}? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            setLoadingItems(true);
            const tableName = type === 'post' ? 'posts' : type === 'project' ? 'projects' : 'certificates';
            const { error: deleteError } = await supabase
                .from(tableName)
                .delete()
                .eq('id', idToDelete);

            if (deleteError) throw deleteError;

            alert('Eliminado correctamente.');
            fetchUserItems(itemType);
        } catch (err: any) {
            console.error('Error deleting:', err);
            alert('Error al eliminar: ' + err.message);
            setLoadingItems(false);
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

            let newGalleryUrls: string[] = [...galleryUrls];
            if (galleryFiles.length > 0) {
                const uploadPromises = galleryFiles.map(async (file) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `projects/gallery/${fileName}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('blog-images')
                        .upload(filePath, file);
                        
                    if (!uploadError) {
                        const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath);
                        return data.publicUrl;
                    }
                    return null;
                });
                
                const uploadedUrls = await Promise.all(uploadPromises);
                const validUrls = uploadedUrls.filter((url): url is string => url !== null);
                newGalleryUrls = [...newGalleryUrls, ...validUrls];
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No se encontró sesión de usuario');

            const newSlug = formData.title
                .toLowerCase()
                .replace(/[^a-záéíóúñ0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');

            const postData: any = {
                title: formData.title,
                slug: newSlug,
                status: formData.status,
            };

            if (itemType === 'certificate') {
                postData.url = formData.url;
            } else {
                postData.excerpt = formData.excerpt;
                postData.content = formData.content;

                if (itemType === 'post') {
                    postData.category_id = formData.category_id;
                }

                if (imageUrl) {
                    postData.image_url = imageUrl;
                }

                if (itemType === 'project') {
                    postData.gallery = newGalleryUrls;
                }
            }

            const tableName = itemType === 'post' ? 'posts' : itemType === 'project' ? 'projects' : 'certificates';

            let error;
            if (itemId) {
                // Update existing
                const { error: updateError } = await supabase
                    .from(tableName)
                    .update(postData)
                    .eq('id', itemId);
                error = updateError;
            } else {
                // Insert new
                postData.author_id = user.id;
                const { error: insertError } = await supabase
                    .from(tableName)
                    .insert(postData);
                error = insertError;
            }

            if (error) throw error;

            alert(`¡${itemType === 'post' ? 'Post' : itemType === 'project' ? 'Proyecto' : 'Certificado'} ${itemId ? 'actualizado' : 'publicado'} con éxito!`);
            if (itemId) {
                navigate(itemType === 'post' ? '/blog' : itemType === 'project' ? '/fotografias' : '/archivos');
            } else {
                fetchUserItems(itemType);
                setViewMode('list');
                // Reset form
                setFormData({ title: '', excerpt: '', content: '', category_id: '', url: '', status: 'published' });
                setImageFile(null);
                setImagePreview(null);
                setGalleryFiles([]);
                setGalleryUrls([]);
            }
        } catch (error: any) {
            console.error('Error publishing:', error);
            alert('Error al publicar: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setItemId(null);
        setFormData({ title: '', excerpt: '', content: '', category_id: '', url: '', status: 'published' });
        setImageFile(null);
        setImagePreview(null);
        setGalleryFiles([]);
        setGalleryUrls([]);
        setViewMode('form');
        navigate('/publicar');
    };

    return (
        <div className="w-full min-h-screen bg-[#f8f8f8] flex flex-col items-center py-12 px-4 animate-in fade-in duration-700">
            {fetchingData ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#702d8d] animate-spin" />
                </div>
            ) : (
                <div className="max-w-5xl w-full flex flex-col gap-12">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <button
                            onClick={() => navigate(itemType === 'post' ? '/blog' : '/fotografias')}
                            className={`flex items-center gap-2 font-bold hover:translate-x-[-4px] transition-transform w-full md:w-auto ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}
                        >
                            <ArrowLeft size={20} />
                            Volver a {itemType === 'post' ? 'Blog' : 'Proyectos'}
                        </button>
                        <HeaderBar title="Gestión de Contenido" />

                        <div className={`flex bg-white rounded-full shadow-sm p-1 border w-full md:w-auto ${itemType === 'post' ? 'border-[#702d8d]/10' : 'border-[#5cc8d7]/10'}`}>
                            <button
                                onClick={() => viewMode !== 'list' && fetchUserItems(itemType)}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'list' 
                                    ? (itemType === 'post' ? 'bg-[#702d8d] text-white shadow-md' : 'bg-[#5cc8d7] text-white shadow-md') 
                                    : (itemType === 'post' ? 'text-[#702d8d] hover:bg-[#702d8d]/5' : 'text-[#5cc8d7] hover:bg-[#5cc8d7]/5')}`}
                            >
                                <List size={16} />
                                Mi Contenido
                            </button>
                            <button
                                onClick={handleCreateNew}
                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${viewMode === 'form' && !itemId 
                                    ? (itemType === 'post' ? 'bg-[#702d8d] text-white shadow-md' : 'bg-[#5cc8d7] text-white shadow-md') 
                                    : (itemType === 'post' ? 'text-[#702d8d] hover:bg-[#702d8d]/5' : 'text-[#5cc8d7] hover:bg-[#5cc8d7]/5')}`}
                            >
                                <Plus size={16} />
                                Nuevo
                            </button>
                        </div>
                    </div>

                    {/* Central toggle between Post and Project */}
                    {(!itemId || viewMode === 'list') && (
                        <div className="flex justify-center -mt-6">
                            <div className="bg-white rounded-full shadow-md p-1.5 flex gap-1 border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => { setItemType('post'); fetchUserItems('post'); }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${itemType === 'post' ? 'bg-[#702d8d] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FileText size={18} />
                                    Publicaciones (Blog)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setItemType('project'); fetchUserItems('project'); }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${itemType === 'project' ? 'bg-[#5cc8d7] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <Camera size={18} />
                                    Fotografías (Proyectos)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setItemType('certificate'); fetchUserItems('certificate'); }}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all ${itemType === 'certificate' ? 'bg-[#5cc8d7] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <FileArchive size={18} />
                                    Certificados
                                </button>
                            </div>
                        </div>
                    )}

                    {viewMode === 'list' ? (
                        <div className={`bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12 border min-h-[50vh] ${itemType === 'post' ? 'border-[#702d8d]/10' : 'border-[#5cc8d7]/10'}`}>
                            <h2 className={`text-2xl font-black mb-8 ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                {itemType === 'post' ? 'Mis Publicaciones' : itemType === 'project' ? 'Mis Proyectos' : 'Mis Certificados'}
                            </h2>

                            {loadingItems ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className={`w-10 h-10 animate-spin ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`} />
                                </div>
                            ) : userItems.length === 0 ? (
                                <div className="text-center py-16 flex flex-col items-center gap-6">
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${itemType === 'post' ? 'bg-[#702d8d]/10 text-[#702d8d]' : 'bg-[#5cc8d7]/10 text-[#5cc8d7]'}`}>
                                        <List size={40} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Aún no tienes contenido aquí</h3>
                                        <p className="text-gray-500">Crea tu primer {itemType === 'post' ? 'post' : itemType === 'project' ? 'proyecto' : 'certificado'} para empezar.</p>
                                    </div>
                                    <button
                                        onClick={handleCreateNew}
                                        className={`px-8 py-3 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2 mt-4 ${itemType === 'post' ? 'bg-[#702d8d]' : 'bg-[#5cc8d7]'}`}
                                    >
                                        <Plus size={20} />
                                        Crear {itemType === 'post' ? 'post' : itemType === 'project' ? 'proyecto' : 'certificado'}
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {userItems.map(item => (
                                        <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border transition-colors bg-[#f8f8f8]/50 ${itemType === 'post' ? 'border-[#f0f0f0] hover:border-[#702d8d]/30' : 'border-[#f0f0f0] hover:border-[#5cc8d7]/30'}`}>
                                            <div className="flex flex-col gap-2">
                                                <h3 className="text-lg font-bold text-[#1a1a1a] line-clamp-1">{item.title}</h3>
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-500">
                                                        {new Date(item.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.status === 'published' ? 'Publicado' : 'Borrador'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => navigate(`/editar/${item.slug}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e0e0e0] rounded-xl text-gray-700 font-bold hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm"
                                                >
                                                    <Edit size={16} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteItem(item.id, itemType)}
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
                        <form onSubmit={handleSubmit} className={`bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 md:p-12 flex flex-col gap-8 border ${itemType === 'post' ? 'border-[#702d8d]/10' : 'border-[#5cc8d7]/10'}`}>

                            <div className="flex items-center gap-3 mb-2">
                                {itemId && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-widest">
                                        Modo Edición
                                    </span>
                                )}
                                <h2 className={`text-2xl font-black ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                    {itemId ? "Actualizar Información" : `Detalles del Nuevo ${itemType === 'post' ? 'Post' : itemType === 'project' ? 'Proyecto' : 'Certificado'}`}
                                </h2>
                            </div>

                            {itemType === 'certificate' ? (
                                <div className="space-y-6 w-full">
                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-wider block text-[#5cc8d7]">
                                            Nombre del Archivo o Certificado
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Ej: Certificado I Congreso de Ciencia..."
                                            className="w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium focus:ring-[#5cc8d7]"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-black uppercase tracking-wider block text-[#5cc8d7]">
                                            Enlace (URL)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <LinkIcon size={20} className="text-gray-400" />
                                            </div>
                                            <input
                                                required
                                                type="url"
                                                placeholder="https://..."
                                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium focus:ring-[#5cc8d7]"
                                                value={formData.url}
                                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Image Upload Area */}
                                    <div className="w-full">
                                        <label className={`text-sm font-black uppercase tracking-wider mb-3 block ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                            {itemType === 'post' ? 'Imagen Destacada' : 'Fotografía del Proyecto'}
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative h-64 md:h-80 w-full rounded-3xl border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center gap-4 ${imagePreview ? 'border-transparent' : (itemType === 'post' ? 'border-[#702d8d]/20 bg-[#702d8d]/5 hover:bg-[#702d8d]/10' : 'border-[#5cc8d7]/20 bg-[#5cc8d7]/5 hover:bg-[#5cc8d7]/10')}`}
                                        >
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); }}
                                                        className={`absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                                        <Upload size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`font-bold text-lg ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>Haz clic para subir una imagen</p>
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

                                    <div className={`grid ${itemType === 'post' ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
                                        <div className="space-y-3">
                                            <label className={`text-sm font-black uppercase tracking-wider block ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                                Título del {itemType === 'post' ? 'Post' : 'Proyecto'}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Escribe un título impactante..."
                                                className={`w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium ${itemType === 'post' ? 'focus:ring-[#702d8d]' : 'focus:ring-[#5cc8d7]'}`}
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        {itemType === 'post' && (
                                            <div className="space-y-3">
                                                <label className={`text-sm font-black uppercase tracking-wider block ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                                    Categoría
                                                </label>
                                                <select
                                                    required
                                                    className={`w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium appearance-none ${itemType === 'post' ? 'focus:ring-[#702d8d]' : 'focus:ring-[#5cc8d7]'}`}
                                                    value={formData.category_id}
                                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                                >
                                                    <option value="">Selecciona una categoría</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className={`text-sm font-black uppercase tracking-wider block ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                            Extracto (Breve resumen)
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Una breve descripción que invite a leer..."
                                            className={`w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium resize-none ${itemType === 'post' ? 'focus:ring-[#702d8d]' : 'focus:ring-[#5cc8d7]'}`}
                                            value={formData.excerpt}
                                            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                        ></textarea>
                                    </div>

                                    <div className="space-y-3">
                                        <label className={`text-sm font-black uppercase tracking-wider block ${itemType === 'post' ? 'text-[#702d8d]' : 'text-[#5cc8d7]'}`}>
                                            Contenido {itemType === 'post' ? 'del Post' : 'y Detalles'}
                                        </label>
                                        <textarea
                                            required
                                            rows={10}
                                            placeholder="Escribe aquí toda la información..."
                                            className={`w-full px-6 py-4 rounded-2xl bg-[#f8f8f8] border-none focus:ring-2 font-medium resize-y ${itemType === 'post' ? 'focus:ring-[#702d8d]' : 'focus:ring-[#5cc8d7]'}`}
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        ></textarea>
                                    </div>

                                    {itemType === 'project' && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-black text-[#5cc8d7] uppercase tracking-wider block">
                                                Galería de Imágenes (Opcional)
                                            </label>
                                            <input 
                                                type="file" 
                                                multiple 
                                                accept="image/*" 
                                                ref={galleryInputRef} 
                                                onChange={handleGalleryChange} 
                                                className="hidden" 
                                            />
                                            <div className="flex flex-wrap gap-4">
                                                {galleryUrls.map((url, i) => (
                                                    <div key={`existing-${i}`} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-[#5cc8d7]/20">
                                                        <img src={url} alt={`Gallery existing ${i}`} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeGalleryImage(i, true)} className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500 p-1 hover:bg-white"><X size={14} /></button>
                                                    </div>
                                                ))}
                                                {galleryFiles.map((file, i) => (
                                                    <div key={`new-${i}`} className="relative h-24 w-24 rounded-2xl overflow-hidden border border-[#5cc8d7]/20">
                                                        <img src={URL.createObjectURL(file)} alt={`Gallery preview ${i}`} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => removeGalleryImage(i, false)} className="absolute top-1 right-1 bg-white/80 rounded-full text-red-500 p-1 hover:bg-white"><X size={14} /></button>
                                                    </div>
                                                ))}
                                                <button 
                                                    type="button" 
                                                    onClick={() => galleryInputRef.current?.click()} 
                                                    className="h-24 w-24 rounded-2xl border-2 border-dashed border-[#5cc8d7]/30 bg-[#5cc8d7]/5 text-[#5cc8d7] flex flex-col items-center justify-center gap-1 hover:bg-[#5cc8d7]/10 transition-colors"
                                                >
                                                    <Plus size={24} />
                                                    <span className="text-[10px] font-bold">Agregar</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-[#f0f0f0]">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                                        className={`px-8 py-3 rounded-full font-bold transition-all ${formData.status === 'draft' ? (itemType === 'post' ? 'bg-[#702d8d] text-white shadow-lg' : 'bg-[#5cc8d7] text-white shadow-lg') : 'bg-[#e0e0e0] text-[#707070] hover:bg-[#d0d0d0]'}`}
                                    >
                                        Borrador
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'published' })}
                                        className={`px-8 py-3 rounded-full font-bold transition-all ${formData.status === 'published' ? (itemType === 'post' ? 'bg-[#702d8d] text-white shadow-lg' : 'bg-[#5cc8d7] text-white shadow-lg') : 'bg-[#e0e0e0] text-[#707070] hover:bg-[#d0d0d0]'}`}
                                    >
                                        Publicar
                                    </button>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={`w-full md:w-auto px-12 py-5 text-white rounded-full font-black text-lg hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 ${itemType === 'post' ? 'bg-[#702d8d] shadow-[0_10px_30px_rgba(112,45,141,0.3)]' : 'bg-[#5cc8d7] shadow-[0_10px_30px_rgba(92,200,215,0.3)]'}`}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" />
                                            PROCESANDO...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={24} />
                                            GUARDAR {itemType === 'post' ? 'PUBLICACIÓN' : itemType === 'project' ? 'PROYECTO' : 'CERTIFICADO'}
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

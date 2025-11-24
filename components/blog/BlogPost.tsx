
import React, { useEffect, useState } from 'react';
import { BlogPost, View } from '../../types';
import { getBlogPostBySlug } from '../../services/mockApiService';
import Seo from '../ui/Seo';
import { LoaderIcon, ChevronLeftIcon, UserIcon, CalendarIcon } from '../icons';

interface BlogPostProps {
    slug: string;
    setView: (view: View) => void;
}

const BlogPostPage: React.FC<BlogPostProps> = ({ slug, setView }) => {
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            const data = await getBlogPostBySlug(slug);
            setPost(data || null);
            setLoading(false);
        };
        fetchPost();
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-dark"><LoaderIcon className="w-12 h-12 text-brand-cyan" /></div>;
    
    if (!post) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark text-white">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <button onClick={() => setView({ page: 'blog' })} className="text-brand-cyan hover:underline">Return to Blog</button>
        </div>
    );

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "image": post.coverImage,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "DJBook",
            "logo": {
                "@type": "ImageObject",
                "url": "https://djbook.in/logo.png"
            }
        },
        "datePublished": post.date,
        "description": post.excerpt
    };

    return (
        <div className="bg-brand-dark min-h-screen pt-20">
            <Seo title={`${post.title} - DJBook Blog`} description={post.excerpt} jsonLd={jsonLd} />

            <article className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-12">
                <button onClick={() => setView({ page: 'blog' })} className="flex items-center text-gray-400 hover:text-brand-cyan mb-8 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to Blog
                </button>

                <header className="mb-10">
                    <div className="flex gap-2 mb-4">
                        {post.tags.map(tag => (
                            <span key={tag} className="text-brand-cyan text-xs font-bold uppercase tracking-widest border border-brand-cyan/30 px-2 py-1 rounded">{tag}</span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold text-white font-display leading-tight mb-6">{post.title}</h1>
                    
                    <div className="flex items-center gap-6 text-gray-400 border-y border-white/10 py-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 p-1 rounded-full"><UserIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-white/10 p-1 rounded-full"><CalendarIcon className="w-4 h-4" /></div>
                            <span className="text-sm font-medium">{post.date}</span>
                        </div>
                    </div>
                </header>

                <div className="relative h-[400px] w-full rounded-2xl overflow-hidden mb-12">
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl text-gray-300 leading-relaxed mb-6 font-light">{post.excerpt}</p>
                    {/* Simulating HTML content rendering */}
                    <div className="text-gray-300 space-y-6">
                        {post.content.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPostPage;

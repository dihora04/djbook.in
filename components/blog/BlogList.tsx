
import React, { useEffect, useState } from 'react';
import { BlogPost, View } from '../../types';
import { getBlogPosts } from '../../services/mockApiService';
import Seo from '../ui/Seo';
import { LoaderIcon } from '../icons';

interface BlogListProps {
    setView: (view: View) => void;
}

const BlogList: React.FC<BlogListProps> = ({ setView }) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const data = await getBlogPosts();
            setPosts(data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    return (
        <div className="pt-24 bg-brand-dark min-h-screen">
            <Seo title="DJBook Blog - Tips, Trends & Guides" description="Stay updated with the latest trends in wedding music, DJ equipment, and event planning tips." />
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white font-display mb-4">The Beat Drop</h1>
                    <p className="text-xl text-gray-400">Insights, guides, and stories from the world of DJing.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center"><LoaderIcon className="w-12 h-12 text-brand-cyan" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map(post => (
                            <div 
                                key={post.id} 
                                onClick={() => setView({ page: 'blog-post', slug: post.slug })}
                                className="group cursor-pointer bg-brand-surface border border-white/10 rounded-2xl overflow-hidden hover:border-brand-cyan/50 transition-all duration-300"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {post.tags.slice(0, 2).map(tag => (
                                            <span key={tag} className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="text-sm text-gray-500 mb-2">{post.date} • {post.author}</div>
                                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-brand-cyan transition-colors line-clamp-2">{post.title}</h2>
                                    <p className="text-gray-400 text-sm line-clamp-3">{post.excerpt}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;

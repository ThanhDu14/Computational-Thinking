import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, Tag, Calendar, Share2 } from 'lucide-react';
import { BLOG_POSTS } from './BlogPage';

const CATEGORY_COLORS = {
  'Khám Phá': 'bg-emerald-100 text-emerald-700',
  'Văn Hóa': 'bg-amber-100 text-amber-700',
  'Bãi Biển': 'bg-sky-100 text-sky-700',
  'Kinh Nghiệm': 'bg-violet-100 text-violet-700',
};

function renderContent(content) {
  const lines = content.split('\n');
  const elements = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-3xl font-bold font-display text-on-surface mt-10 mb-4 border-b border-outline-variant/20 pb-3">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-2xl font-bold font-display text-on-surface mt-8 mb-3">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={key++} className="font-bold text-on-surface font-body text-base mb-2">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={key++} className="text-on-surface-variant font-body text-base mb-1.5 ml-4 list-disc">
          {line.slice(2)}
        </li>
      );
    } else if (line.match(/^✅/)) {
      elements.push(
        <li key={key++} className="text-on-surface font-body text-base mb-2 flex items-start gap-2 list-none">
          <span className="text-emerald-500 mt-0.5">✅</span>
          {line.slice(2)}
        </li>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={key++} className="h-3" />);
    } else {
      // parse inline bold **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <p key={key++} className="text-on-surface-variant font-body text-base leading-relaxed mb-1">
          {parts.map((part, idx) =>
            part.startsWith('**') && part.endsWith('**')
              ? <strong key={idx} className="text-on-surface font-semibold">{part.slice(2, -2)}</strong>
              : part
          )}
        </p>
      );
    }
  }
  return elements;
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const post = BLOG_POSTS.find(p => p.id === id);

  if (!post) {
    return (
      <div className="w-full pt-40 pb-20 text-center">
        <h1 className="text-4xl font-bold font-display text-on-surface mb-4">Bài viết không tồn tại</h1>
        <button onClick={() => navigate('/blog')} className="text-primary font-bold flex items-center gap-2 mx-auto mt-4">
          <ArrowLeft className="w-4 h-4" /> Quay lại Blog
        </button>
      </div>
    );
  }

  const related = BLOG_POSTS.filter(p => p.id !== post.id).slice(0, 2);

  return (
    <div className="w-full pt-36 pb-20">
      {/* Hero Image */}
      <div className="relative h-[55vh] w-full overflow-hidden mb-16">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-4xl mx-auto px-6 pb-12">
          <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 ${CATEGORY_COLORS[post.category] || 'bg-white/20 text-white'}`}>
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-white leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-5 text-white/70 text-sm font-body">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Back & Share */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-body font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Blog
          </button>
          <button
            onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-body text-sm font-semibold transition-all"
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </button>
        </div>

        {/* Lead excerpt */}
        <p className="text-xl font-body text-on-surface leading-relaxed mb-10 pb-10 border-b border-outline-variant/20 italic">
          {post.excerpt}
        </p>

        {/* Content */}
        <article className="prose-custom">
          {renderContent(post.content)}
        </article>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-outline-variant/20">
          <Tag className="w-4 h-4 text-outline self-center" />
          {post.tags.map(tag => (
            <span key={tag} className="px-4 py-1.5 bg-surface-container rounded-full text-sm font-body font-semibold text-on-surface-variant hover:bg-primary-container hover:text-primary cursor-pointer transition-all">
              {tag}
            </span>
          ))}
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-display text-on-surface mb-8">Bài Viết Liên Quan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => { navigate(`/blog/${rel.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="group cursor-pointer flex gap-4 bg-surface border border-outline-variant/10 rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <img src={rel.image} alt={rel.title} className="w-24 h-24 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 ${CATEGORY_COLORS[rel.category] || ''}`}>
                      {rel.category}
                    </span>
                    <h3 className="font-bold font-display text-on-surface text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {rel.title}
                    </h3>
                    <span className="text-xs text-on-surface-variant font-body">{rel.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

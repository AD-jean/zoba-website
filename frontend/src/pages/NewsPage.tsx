import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { newsApi } from '../lib/api';
import { formatDate } from '../lib/format';
import Reveal from '../components/Reveal';
import type { News } from '../types/database';

function ArticleModal({ article, onClose }: { article: News; onClose: () => void }) {
  const [closing, setClosing] = useState(false);

  const requestClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/50 backdrop-blur-sm overflow-y-auto transition-opacity duration-200 ${closing ? 'opacity-0' : 'animate-fade-in'}`}
      onClick={requestClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl ${closing ? 'animate-scale-out' : 'animate-scale-in'}`}
        onClick={e => e.stopPropagation()}
      >
        {article.image && (
          <div className="relative h-64 overflow-hidden rounded-t-2xl">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xs text-teal-500 font-medium mb-1">{formatDate(article.publishedAt)}</p>
              <h2 className="text-2xl font-bold text-teal-800 leading-snug">{article.title}</h2>
            </div>
            <button onClick={requestClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-200 flex-shrink-0">
              <X size={22} />
            </button>
          </div>
          {article.excerpt && (
            <p className="text-gray-600 font-medium mb-4 leading-relaxed">{article.excerpt}</p>
          )}
          {article.content && (
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
              {article.content.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [selected, setSelected] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    newsApi.getAll().then((data: News[]) => { setNews(data); setLoading(false); });
  }, []);

  const [featured, ...rest] = news;

  return (
    <>
      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}

      <section className="relative pt-32 pb-20 bg-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Actualités</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            Restez informé des dernières nouvelles et annonces de la Zone Baptiste Agapé.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <BookOpen size={40} className="mx-auto mb-4 opacity-40" />
              <p>Aucune actualité publiée pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <Reveal
                  className="card group cursor-pointer mb-10 grid md:grid-cols-2 gap-0 overflow-hidden"
                  onClick={() => setSelected(featured)}
                >
                  <div className="relative h-64 md:h-auto overflow-hidden bg-teal-100">
                    {featured.image ? (
                      <img src={featured.image} alt={featured.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200">
                        <BookOpen size={48} className="text-teal-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-teal-500 tracking-widest uppercase mb-3">À la une</span>
                    <p className="text-sm text-gray-400 mb-2">{formatDate(featured.publishedAt)}</p>
                    <h2 className="text-2xl font-bold text-teal-800 mb-3 leading-snug">{featured.title}</h2>
                    {featured.excerpt && (
                      <p className="text-gray-500 leading-relaxed mb-6">{featured.excerpt}</p>
                    )}
                    <span className="text-teal-600 text-sm font-semibold group-hover:underline inline-flex items-center gap-1">
                      Lire la suite <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Reveal>
              )}

              {/* Rest */}
              {rest.length > 0 && (
                <Reveal className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map(article => (
                    <article
                      key={article._id}
                      className="card group cursor-pointer"
                      onClick={() => setSelected(article)}
                    >
                      <div className="h-48 overflow-hidden bg-teal-50">
                        {article.image ? (
                          <img src={article.image} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
                            <BookOpen size={32} className="text-teal-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-teal-500 mb-1.5">{formatDate(article.publishedAt)}</p>
                        <h3 className="font-bold text-teal-800 text-lg leading-snug mb-2">{article.title}</h3>
                        {article.excerpt && (
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </Reveal>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, BookOpen, Heart, Star, ArrowRight, Calendar, MapPin,
  ChevronRight, Quote, ShieldCheck, Gem, Flame, Sprout
} from 'lucide-react';
import { activitiesApi, newsApi, galleryApi } from '../lib/api';
import { formatDate } from '../lib/format';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import OrganicFloat from '../components/OrganicFloat';
import TiltCard from '../components/TiltCard';
import DepartmentIcon from '../components/DepartmentIcon';
import type { Activity, News, GalleryItem } from '../types/database';

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/8468470/pexels-photo-8468470.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/80 to-teal-700/40" />
      </div>

      <OrganicFloat variant="hero" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 opacity-0 animate-slide-up"
            style={{ animationDelay: '0ms' }}
          >
            <BookOpen size={14} className="text-teal-300" />
            <span className="text-teal-100 text-sm font-medium">Convention Baptiste du Togo</span>
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-display opacity-0 animate-slide-up"
            style={{ animationDelay: '80ms' }}
          >
            Zone Baptiste<br />
            <span className="text-teal-300">Agapé</span>
          </h1>

          <p
            className="text-lg text-teal-100 leading-relaxed mb-10 max-w-xl opacity-0 animate-slide-up"
            style={{ animationDelay: '160ms' }}
          >
            Fraternité, Foi et Service. Ensemble, nous bâtissons une communauté ancrée dans l'amour de Dieu et le service des uns envers les autres.
          </p>

          <div className="flex flex-wrap gap-4 opacity-0 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <Link to="/activites" className="group btn-primary bg-white text-teal-700 hover:bg-teal-50 hover:text-teal-800 shadow-lg">
              Nos activités <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link to="/a-propos" className="btn-outline border-white/60 text-white hover:bg-white/10 hover:text-white">
              En savoir plus
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50">
        <div className="w-px h-8 bg-white/30 animate-pulse" />
        <span className="text-xs tracking-widest">DÉFILER</span>
      </div>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function Stats() {
  const stats = [
    { value: 50, suffix: '+', label: 'Églises membres', icon: BookOpen },
    { value: 2000, suffix: '+', label: 'Fidèles', icon: Users },
    { value: 4, suffix: '', label: 'Départements actifs', icon: Star },
    { value: 20, suffix: '+', label: "Années d'existence", icon: Heart },
  ];

  return (
    <section className="bg-teal-700 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, suffix, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon size={24} className="text-teal-300 mx-auto mb-3" />
              <CountUp
                end={value}
                suffix={suffix}
                className="block text-3xl lg:text-4xl font-bold text-white font-display mb-1"
              />
              <div className="text-teal-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About Preview ───────────────────────────────────────────────────────────

function AboutPreview() {
  return (
    <section className="py-24 bg-white">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="section-label">À propos de nous</p>
            <h2 className="section-title mb-6">
              Une zone unie dans la foi et l'amour fraternel
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              La Zone Baptiste Agapé (ZOBA) est une structure fédératrice regroupant plusieurs églises baptistes au sein de la Convention Baptiste du Togo (CBT). Elle œuvre pour le rayonnement de l'Évangile et le développement spirituel de ses membres.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Sous la direction du bureau de zone, et avec le soutien du Président de la CBT, nous organisons des activités pour tous les groupes : hommes, femmes, jeunes et enfants.
            </p>

            <div className="flex items-start gap-4 bg-teal-50 rounded-xl p-5 mb-8">
              <Quote size={20} className="text-teal-500 flex-shrink-0 mt-1" />
              <p className="text-teal-800 italic text-sm leading-relaxed">
                "Car là où deux ou trois sont assemblés en mon nom, je suis au milieu d'eux." — Matthieu 18:20
              </p>
            </div>

            <Link to="/a-propos" className="group btn-primary">
              Découvrir notre histoire <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <img
                src="https://images.pexels.com/photos/3184416/pexels-photo-3184416.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Réunion fraternelle"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-teal-600 text-white rounded-2xl p-5 shadow-xl">
              <div className="text-2xl font-bold font-display">ZOBA</div>
              <div className="text-teal-200 text-xs tracking-widest">Zone Baptiste Agapé</div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Departments ─────────────────────────────────────────────────────────────

function DepartmentsSection() {
  const departments = [
    {
      name: 'Hommes',
      icon: ShieldCheck,
      color: 'bg-blue-50 border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      description: 'Édification, fraternité et formation des hommes dans la foi et le leadership chrétien.',
      href: '/departements?dept=Hommes',
    },
    {
      name: 'Femmes',
      icon: Gem,
      color: 'bg-rose-50 border-rose-200',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      description: 'Épanouissement, témoignage et service des femmes de foi dans la communauté.',
      href: '/departements?dept=Femmes',
    },
    {
      name: 'Jeunesse',
      icon: Flame,
      color: 'bg-amber-50 border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-700',
      description: 'Engagement, formation et rayonnement de la nouvelle génération pour Christ.',
      href: '/departements?dept=Jeunesse',
    },
    {
      name: 'Enfants',
      icon: Sprout,
      color: 'bg-green-50 border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-700',
      description: 'Éveil biblique et accompagnement des plus jeunes dans la découverte de la foi.',
      href: '/departements?dept=Enfants',
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-label">Nos départements</p>
          <h2 className="section-title max-w-2xl mx-auto">
            Un espace pour chaque membre de la famille
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map(({ name, icon, color, iconBg, iconColor, description, href }) => (
            <Link
              key={name}
              to={href}
              className={`card border ${color} group p-6 flex flex-col`}
            >
              <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
                <DepartmentIcon icon={icon} size={22} className={iconColor} />
              </div>
              <h3 className="font-bold text-teal-800 text-lg mb-2">{name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">{description}</p>
              <div className="mt-4 flex items-center text-teal-600 text-sm font-semibold group-hover:gap-2 transition-all gap-1">
                Voir plus <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── Activities Section ───────────────────────────────────────────────────────

function ActivitiesSection({ activities, loading }: { activities: Activity[]; loading: boolean }) {
  const deptColors: Record<string, string> = {
    Tous: 'bg-teal-100 text-teal-700',
    Hommes: 'bg-blue-100 text-blue-700',
    Femmes: 'bg-rose-100 text-rose-700',
    Jeunesse: 'bg-amber-100 text-amber-700',
    Enfants: 'bg-green-100 text-green-700',
  };

  return (
    <section className="py-24 bg-white">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="section-label">Événements</p>
            <h2 className="section-title">Prochaines activités</h2>
          </div>
          <Link to="/activites" className="group btn-outline flex-shrink-0">
            Voir tout <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activities.slice(0, 4).map(activity => (
              <TiltCard key={activity._id} className="card group">
                <div className="relative h-44 overflow-hidden bg-teal-100 tilt-layer">
                  {activity.image ? (
                    <img
                      src={activity.image}
                      alt={activity.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar size={32} className="text-teal-400" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${deptColors[activity.department] || deptColors['Tous']}`}>
                    {activity.department}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-teal-800 mb-2 leading-snug">{activity.title}</h3>
                  {activity.date && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Calendar size={12} />
                      {formatDate(activity.date)}
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} />
                      {activity.location}
                    </div>
                  )}
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

// ─── News Section ─────────────────────────────────────────────────────────────

function NewsSection({ news, loading }: { news: News[]; loading: boolean }) {
  return (
    <section className="py-24 bg-gray-50">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="section-label">Blog</p>
            <h2 className="section-title">Actualités récentes</h2>
          </div>
          <Link to="/actualites" className="group btn-outline flex-shrink-0">
            Voir tout <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse h-72" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {news.slice(0, 3).map((article, i) => (
              <article key={article._id} className={`card group ${i === 0 ? 'md:col-span-1' : ''}`}>
                <div className="relative h-52 overflow-hidden bg-teal-100">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                      <BookOpen size={32} className="text-teal-400" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-xs text-teal-500 font-medium mb-2">{formatDate(article.publishedAt)}</p>
                  <h3 className="font-bold text-teal-800 text-lg leading-snug mb-2">{article.title}</h3>
                  {article.excerpt && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{article.excerpt}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  );
}

// ─── Gallery Preview ──────────────────────────────────────────────────────────

function GalleryPreview({ items }: { items: GalleryItem[] }) {
  return (
    <section className="py-24 bg-teal-800">
      <Reveal className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-400 mb-3">Photothèque</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Notre galerie</h2>
          </div>
          <Link to="/galerie" className="group flex-shrink-0 inline-flex items-center gap-2 border-2 border-white/30 text-white px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 text-sm">
            Voir tout <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.slice(0, 6).map((item, i) => (
            <div
              key={item._id}
              className={`relative overflow-hidden rounded-xl group ${i === 0 ? 'md:row-span-2' : ''}`}
              style={{ aspectRatio: i === 0 ? undefined : '4/3' }}
            >
              <img
                src={`${item.image}?auto=compress&cs=tinysrgb&w=600`}
                alt={item.caption || ''}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                style={i === 0 ? { height: '100%' } : {}}
              />
              <div className="absolute inset-0 bg-teal-900/0 group-hover:bg-teal-900/40 transition-colors duration-300" />
              {item.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-teal-900/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTA() {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      <OrganicFloat variant="cta" />
      <Reveal className="relative max-w-3xl mx-auto px-4 text-center">
        <p className="section-label">Rejoignez-nous</p>
        <h2 className="section-title mb-6">Participez à la vie de la zone</h2>
        <p className="text-gray-600 leading-relaxed mb-10">
          Que vous soyez membre d'une de nos églises ou un visiteur curieux, nous vous accueillons avec joie. Venez participer à nos activités, rencontrez nos communautés et grandissez dans la foi.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/activites" className="group btn-primary">
            Voir les activités <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link to="/dons" className="group btn-outline">
            <Heart size={16} className="transition-transform duration-200 group-hover:scale-110" /> Soutenir la zone
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

// ─── Home ────────────────────────────────────────────────────────────────────

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      activitiesApi.getAll({ upcoming: true }).then((data: Activity[]) => setActivities(data.slice(0, 4))),
      newsApi.getAll({ limit: 3 }).then((data: News[]) => setNews(data)),
      galleryApi.getAll({ limit: 6 }).then((data: GalleryItem[]) => setGallery(data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <Stats />
      <AboutPreview />
      <DepartmentsSection />
      <ActivitiesSection activities={activities} loading={loading} />
      <NewsSection news={news} loading={loading} />
      {gallery.length > 0 && <GalleryPreview items={gallery} />}
      <CTA />
    </>
  );
}

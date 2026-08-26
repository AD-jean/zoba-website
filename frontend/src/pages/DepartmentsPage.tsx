import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, ShieldCheck, Gem, Flame, Sprout, type LucideIcon } from 'lucide-react';
import { activitiesApi } from '../lib/api';
import { formatDate } from '../lib/format';
import DepartmentIcon from '../components/DepartmentIcon';
import type { Activity, Department } from '../types/database';

type Dept = { id: Department; label: string; icon: LucideIcon; color: string; bgColor: string; description: string; verse: string; verseRef: string };

const DEPTS: Dept[] = [
  {
    id: 'Hommes',
    label: 'Hommes',
    icon: ShieldCheck,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Le département des hommes de la ZOBA œuvre pour l\'édification spirituelle et le leadership chrétien des frères. À travers des retraites, des études bibliques et des actions communautaires, nous encourageons chaque homme à être un pilier de foi dans sa famille et son église.',
    verse: 'Soyez forts et courageux.',
    verseRef: 'Josué 1:9',
  },
  {
    id: 'Femmes',
    label: 'Femmes',
    icon: Gem,
    color: 'text-rose-700',
    bgColor: 'bg-rose-50 border-rose-200',
    description: 'Le département des femmes rassemble les sœurs dans la prière, le service et le témoignage. Il organise des conférences, des groupes de soutien et des projets sociaux visant à fortifier les femmes dans leur foi et leur rôle dans la société.',
    verse: 'La femme vertueuse, qui la trouvera ? Sa valeur dépasse les coraux.',
    verseRef: 'Proverbes 31:10',
  },
  {
    id: 'Jeunesse',
    label: 'Jeunesse',
    icon: Flame,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    description: 'La jeunesse de la ZOBA est dynamique et engagée. Elle forme la prochaine génération de leaders chrétiens à travers des camps, des ateliers de formation et des projets missionnaires. Un espace d\'épanouissement pour chaque jeune.',
    verse: 'Que personne ne méprise ta jeunesse.',
    verseRef: '1 Timothée 4:12',
  },
  {
    id: 'Enfants',
    label: 'Enfants',
    icon: Sprout,
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Le département des enfants plante les graines de la foi dès le plus jeune âge. À travers des programmes créatifs, des histoires bibliques et des activités ludiques, nous accompagnons les enfants dans leur croissance spirituelle.',
    verse: 'Laissez les petits enfants venir à moi.',
    verseRef: 'Marc 10:14',
  },
];

export default function DepartmentsPage() {
  const [params] = useSearchParams();
  const defaultDept = (params.get('dept') as Department) || 'Hommes';
  const [active, setActive] = useState<Department>(defaultDept);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    activitiesApi.getAll({ department: active })
      .then((data: Activity[]) => setActivities(data.slice(0, 6)));
  }, [active]);

  const current = DEPTS.find(d => d.id === active)!;

  return (
    <>
      <section className="relative pt-32 pb-20 bg-gradient-animated overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">Organisation</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">Nos départements</h1>
          <p className="text-teal-200 text-lg max-w-xl">
            La zone est organisée en quatre départements pour mieux servir chaque membre de la communauté.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 lg:top-20 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto">
            {DEPTS.map(d => (
              <button
                key={d.id}
                onClick={() => setActive(d.id)}
                className={`group flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap ${
                  active === d.id
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <DepartmentIcon icon={d.icon} size={16} className={active === d.id ? 'text-teal-700' : 'text-gray-400'} />
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div key={active} className="grid lg:grid-cols-5 gap-12 animate-fade-in">
            <div className="lg:col-span-2">
              <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl border ${current.bgColor} mb-6`}>
                <DepartmentIcon icon={current.icon} size={22} className={current.color} />
                <span className={`font-bold ${current.color}`}>{current.label}</span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{current.description}</p>

              <div className={`rounded-xl p-5 border ${current.bgColor}`}>
                <p className={`italic text-sm leading-relaxed mb-1 ${current.color}`}>"{current.verse}"</p>
                <p className={`text-xs font-semibold ${current.color} opacity-70`}>— {current.verseRef}</p>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-teal-800 text-lg">Activités du département</h3>
                <Link to={`/activites`} className="group text-teal-600 text-sm font-semibold flex items-center gap-1 hover:underline">
                  Toutes <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>

              {activities.length === 0 ? (
                <div className="py-16 text-center text-gray-400 bg-gray-50 rounded-2xl">
                  <Calendar size={32} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm">Aucune activité prévue pour ce département.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map(activity => (
                    <div key={activity._id} className="flex gap-4 p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50 hover:translate-x-1">
                      {activity.image && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={activity.image} alt={activity.title} loading="lazy" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-teal-800 mb-1 truncate">{activity.title}</h4>
                        {activity.date && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-0.5">
                            <Calendar size={11} /> {formatDate(activity.date)}
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={11} /> {activity.location}
                          </div>
                        )}
                        {activity.description && (
                          <p className="text-gray-500 text-xs mt-1 line-clamp-2">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

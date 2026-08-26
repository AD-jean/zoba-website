import { useEffect, useState } from 'react';
import { BookOpen, Award, Users, Quote } from 'lucide-react';
import { membersApi } from '../lib/api';
import Reveal from '../components/Reveal';
import type { Member } from '../types/database';

function PageHero() {
  return (
    <section className="relative pt-32 pb-20 bg-gradient-animated overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-teal-300 mb-4">À propos</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-display mb-4">
          Qui sommes-nous ?
        </h1>
        <p className="text-teal-200 text-lg max-w-xl leading-relaxed">
          Découvrez l'histoire, la mission et l'équipe dirigeante de la Zone Baptiste Agapé.
        </p>
      </div>
    </section>
  );
}

function Mission() {
  const values = [
    { icon: BookOpen, title: 'Foi', desc: 'Enracinés dans la Parole de Dieu, nous vivons et proclamons l\'Évangile de Jésus-Christ.' },
    { icon: Users, title: 'Fraternité', desc: 'Nous cultivons des relations authentiques et une communauté soudée entre toutes nos églises membres.' },
    { icon: Award, title: 'Service', desc: 'Nous servons Dieu et notre prochain avec excellence, intégrité et amour désintéressé.' },
  ];

  return (
    <section className="py-24 bg-white">
      <Reveal className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <p className="section-label">Notre mission</p>
            <h2 className="section-title mb-6">Une zone au service de Dieu et des hommes</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              La Zone Baptiste Agapé (ZOBA) regroupe plusieurs églises baptistes sous l'égide de la Convention Baptiste du Togo (CBT). Notre rôle est de coordonner, encourager et renforcer les activités spirituelles, sociales et éducatives au niveau local.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Fondée sur des valeurs évangéliques, la ZOBA s'engage à former des disciples, à servir les communautés et à témoigner de la grâce de Dieu dans chaque aspect de la vie associative.
            </p>

            <div className="bg-teal-50 rounded-xl p-5 border-l-4 border-teal-600">
              <div className="flex items-start gap-3">
                <Quote size={18} className="text-teal-500 flex-shrink-0 mt-1" />
                <p className="text-teal-800 italic leading-relaxed text-sm">
                  "Aimez-vous les uns les autres comme je vous ai aimés." — Jean 15:12
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group flex gap-5 p-5 rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50 hover:-translate-y-0.5">
                <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Icon size={20} className="text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-teal-800 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
      </Reveal>
    </section>
  );
}

function Leadership({ members }: { members: Member[] }) {
  const grouped = {
    CBT: members.filter(m => m.organization === 'CBT'),
    Zone: members.filter(m => m.organization === 'Zone'),
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="section-label">Leadership</p>
          <h2 className="section-title">Notre équipe dirigeante</h2>
        </Reveal>

        {Object.entries(grouped).map(([org, list]) => list.length > 0 && (
          <div key={org} className="mb-14">
            <h3 className="text-lg font-bold text-teal-700 mb-6 flex items-center gap-2">
              <span className="w-6 h-0.5 bg-teal-400" />
              {org === 'CBT' ? 'Convention Baptiste du Togo' : 'Bureau de Zone'}
            </h3>
            <Reveal className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {list.map(member => (
                <div key={member._id} className="card group text-center p-6">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-teal-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    {member.image ? (
                      <img src={member.image} alt={member.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <Users size={28} className="text-teal-400" />
                    )}
                  </div>
                  <h4 className="font-bold text-teal-800 mb-1">{member.name}</h4>
                  <p className="text-teal-600 text-xs font-semibold tracking-wide uppercase mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-500 text-xs leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AboutPage() {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    membersApi.getAll().then((data: Member[]) => setMembers(data));
  }, []);

  return (
    <>
      <PageHero />
      <Mission />
      <Leadership members={members} />
    </>
  );
}

import { useEffect, useState } from 'react';
import type { AdminUser } from '../../lib/api';
import {
  activitiesApi, newsApi, galleryApi, membersApi,
  contactsApi, subscribersApi, registrationsApi, donationsApi,
} from '../../lib/api';
import {
  BookOpen, Calendar, Image, Users, Mail, MessageSquare, Heart,
  LogOut, Plus, Trash2, Check, X, Edit2, Save, ClipboardList, QrCode
} from 'lucide-react';
import type {
  Activity, ActivityInsert, News, NewsInsert,
  GalleryItem, GalleryInsert, Member, MemberInsert,
  Contact, Subscriber, Registration, Donation, Department
} from '../../types/database';
import ImageUploadField from '../../components/admin/ImageUploadField';
import ScannerTab from './ScannerTab';

type Tab = 'activities' | 'news' | 'gallery' | 'members' | 'contacts' | 'subscribers' | 'registrations' | 'donations' | 'scanner';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'activities', label: 'Activités', icon: <Calendar size={16} /> },
  { id: 'news', label: 'Actualités', icon: <BookOpen size={16} /> },
  { id: 'gallery', label: 'Galerie', icon: <Image size={16} /> },
  { id: 'members', label: 'Bureau', icon: <Users size={16} /> },
  { id: 'contacts', label: 'Messages', icon: <MessageSquare size={16} /> },
  { id: 'subscribers', label: 'Newsletter', icon: <Mail size={16} /> },
  { id: 'registrations', label: 'Inscriptions', icon: <ClipboardList size={16} /> },
  { id: 'donations', label: 'Dons', icon: <Heart size={16} /> },
  { id: 'scanner', label: 'Scanner', icon: <QrCode size={16} /> },
];

const DEPTS: Department[] = ['Tous', 'Hommes', 'Femmes', 'Jeunesse', 'Enfants'];

function ConfirmDelete({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="flex items-center gap-2 animate-fade-in">
      <button onClick={onConfirm} className="text-red-500 hover:text-red-700 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Check size={14} /></button>
      <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-all duration-200 hover:scale-110 active:scale-90"><X size={14} /></button>
    </div>
  );
}

// ─── Activities Tab ───────────────────────────────────────────────────────────

function ActivitiesTab() {
  const [items, setItems] = useState<Activity[]>([]);
  const [form, setForm] = useState<ActivityInsert>({ title: '', description: '', image: '', date: '', location: '', department: 'Tous', organizer: 'Zone', price: 0 });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => activitiesApi.getAll().then((data: Activity[]) =>
    setItems([...data].sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime()))
  );
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) {
      await activitiesApi.update(editId, form);
    } else {
      await activitiesApi.create(form);
    }
    setEditing(false); setEditId(null);
    setForm({ title: '', description: '', image: '', date: '', location: '', department: 'Tous', organizer: 'Zone', price: 0 });
    load();
  };

  const del = async (id: string) => {
    await activitiesApi.delete(id);
    setDeleting(null); load();
  };

  const startEdit = (a: Activity) => {
    setForm({ title: a.title, description: a.description ?? '', image: a.image ?? '', date: a.date ?? '', location: a.location ?? '', department: a.department, organizer: a.organizer, price: a.price ?? 0 });
    setEditId(a._id); setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-teal-800 text-lg">Activités ({items.length})</h2>
        <button onClick={() => { setEditing(true); setEditId(null); }} className="btn-primary text-sm py-2">
          <Plus size={15} /> Ajouter
        </button>
      </div>

      {editing && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          <h3 className="font-semibold text-teal-800">{editId ? 'Modifier' : 'Nouvelle activité'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 font-medium mb-1 block">Titre *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre de l'activité" />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Date</label>
              <input type="date" className="input-field" value={form.date ?? ''} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Lieu</label>
              <input className="input-field" value={form.location ?? ''} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lieu de l'événement" />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Département</label>
              <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value as Department }))}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Organisateur</label>
              <select className="input-field" value={form.organizer} onChange={e => setForm(f => ({ ...f, organizer: e.target.value as 'Zone' | 'Église' }))}>
                <option>Zone</option><option>Église</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Prix (XOF)</label>
              <input
                type="number"
                min={0}
                className="input-field"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                placeholder="0 = gratuit"
              />
            </div>
            <ImageUploadField label="Image" value={form.image ?? ''} onChange={url => setForm(f => ({ ...f, image: url }))} folder="activities" />
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 font-medium mb-1 block">Description</label>
              <textarea rows={3} className="input-field resize-none" value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description de l'activité" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2"><Save size={14} /> Enregistrer</button>
            <button onClick={() => { setEditing(false); setEditId(null); }} className="btn-outline text-sm py-2">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            {item.image && <img src={item.image} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">{item.date ?? '—'} · {item.department} · {item.organizer}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {deleting === item._id ? (
                <ConfirmDelete onConfirm={() => del(item._id)} onCancel={() => setDeleting(null)} />
              ) : (
                <>
                  <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleting(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── News Tab ─────────────────────────────────────────────────────────────────

function NewsTab() {
  const [items, setItems] = useState<News[]>([]);
  const [form, setForm] = useState<NewsInsert>({ title: '', excerpt: '', content: '', image: '', publishedAt: new Date().toISOString() });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => newsApi.getAll().then((data: News[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) {
      await newsApi.update(editId, form);
    } else {
      await newsApi.create(form);
    }
    setEditing(false); setEditId(null);
    setForm({ title: '', excerpt: '', content: '', image: '', publishedAt: new Date().toISOString() });
    load();
  };

  const del = async (id: string) => { await newsApi.delete(id); setDeleting(null); load(); };

  const startEdit = (n: News) => {
    setForm({ title: n.title, excerpt: n.excerpt ?? '', content: n.content ?? '', image: n.image ?? '', publishedAt: n.publishedAt });
    setEditId(n._id); setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-teal-800 text-lg">Actualités ({items.length})</h2>
        <button onClick={() => { setEditing(true); setEditId(null); }} className="btn-primary text-sm py-2"><Plus size={15} /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          <h3 className="font-semibold text-teal-800">{editId ? 'Modifier' : 'Nouvel article'}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Titre *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <ImageUploadField label="Image" value={form.image ?? ''} onChange={url => setForm(f => ({ ...f, image: url }))} folder="news" />
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Extrait</label>
              <textarea rows={2} className="input-field resize-none" value={form.excerpt ?? ''} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Contenu</label>
              <textarea rows={6} className="input-field resize-none" value={form.content ?? ''} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2"><Save size={14} /> Enregistrer</button>
            <button onClick={() => { setEditing(false); setEditId(null); }} className="btn-outline text-sm py-2">Annuler</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item._id} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            {item.image && <img src={item.image} alt="" loading="lazy" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{item.title}</p>
              {item.excerpt && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.excerpt}</p>}
              <p className="text-xs text-gray-300 mt-0.5">{new Date(item.publishedAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {deleting === item._id ? (
                <ConfirmDelete onConfirm={() => del(item._id)} onCancel={() => setDeleting(null)} />
              ) : (
                <>
                  <button onClick={() => startEdit(item)} className="p-1.5 text-gray-400 hover:text-teal-600 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleting(item._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Trash2 size={14} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<GalleryInsert>({ image: '', caption: '', department: 'Tous' });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => galleryApi.getAll().then((data: GalleryItem[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    await galleryApi.create(form);
    setAdding(false); setForm({ image: '', caption: '', department: 'Tous' }); load();
  };

  const del = async (id: string) => { await galleryApi.delete(id); setDeleting(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-teal-800 text-lg">Galerie ({items.length})</h2>
        <button onClick={() => setAdding(true)} className="btn-primary text-sm py-2"><Plus size={15} /> Ajouter</button>
      </div>

      {adding && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          <ImageUploadField label="Image *" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} folder="gallery" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Légende</label>
              <input className="input-field" value={form.caption ?? ''} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Département</label>
              <select className="input-field" value={form.department ?? 'Tous'} onChange={e => setForm(f => ({ ...f, department: e.target.value as Department }))}>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm py-2">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item._id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
            <img src={item.image} alt={item.caption ?? ''} loading="lazy" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
              {deleting === item._id ? (
                <div className="flex gap-2">
                  <button onClick={() => del(item._id)} className="bg-red-500 text-white rounded-full p-1"><Check size={14} /></button>
                  <button onClick={() => setDeleting(null)} className="bg-white text-gray-600 rounded-full p-1"><X size={14} /></button>
                </div>
              ) : (
                <button onClick={() => setDeleting(item._id)} className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 transition-opacity"><Trash2 size={14} /></button>
              )}
            </div>
            {item.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                {item.caption}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Members Tab ──────────────────────────────────────────────────────────────

function MembersTab() {
  const [items, setItems] = useState<Member[]>([]);
  const [form, setForm] = useState<MemberInsert>({ name: '', role: '', image: '', bio: '', organization: 'Zone', order: 0 });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => membersApi.getAll().then((data: Member[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editId) await membersApi.update(editId, form);
    else await membersApi.create(form);
    setEditing(false); setEditId(null);
    setForm({ name: '', role: '', image: '', bio: '', organization: 'Zone', order: 0 });
    load();
  };

  const del = async (id: string) => { await membersApi.delete(id); setDeleting(null); load(); };

  const startEdit = (m: Member) => {
    setForm({ name: m.name, role: m.role, image: m.image ?? '', bio: m.bio ?? '', organization: m.organization, order: m.order });
    setEditId(m._id); setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-teal-800 text-lg">Bureau ({items.length})</h2>
        <button onClick={() => { setEditing(true); setEditId(null); }} className="btn-primary text-sm py-2"><Plus size={15} /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Nom *</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Rôle *</label>
              <input className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Organisation</label>
              <select className="input-field" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value as 'CBT' | 'Zone' }))}>
                <option value="Zone">Zone</option><option value="CBT">CBT</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1 block">Ordre d'affichage</label>
              <input type="number" className="input-field" value={form.order} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <ImageUploadField label="Photo" value={form.image ?? ''} onChange={url => setForm(f => ({ ...f, image: url }))} folder="members" />
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-600 font-medium mb-1 block">Bio</label>
              <textarea rows={3} className="input-field resize-none" value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm py-2"><Save size={14} /> Enregistrer</button>
            <button onClick={() => { setEditing(false); setEditId(null); }} className="btn-outline text-sm py-2">Annuler</button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(item => (
          <div key={item._id} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            <div className="w-10 h-10 rounded-full bg-teal-100 overflow-hidden flex-shrink-0">
              {item.image ? <img src={item.image} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Users size={18} className="text-teal-400 m-auto mt-2.5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{item.name}</p>
              <p className="text-xs text-teal-600">{item.role}</p>
              <p className="text-xs text-gray-400">{item.organization}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {deleting === item._id ? (
                <ConfirmDelete onConfirm={() => del(item._id)} onCancel={() => setDeleting(null)} />
              ) : (
                <>
                  <button onClick={() => startEdit(item)} className="p-1 text-gray-400 hover:text-teal-600 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleting(item._id)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-all duration-200 hover:scale-110 active:scale-90"><Trash2 size={13} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────

function ContactsTab() {
  const [items, setItems] = useState<Contact[]>([]);

  const load = () => contactsApi.getAll().then((data: Contact[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await contactsApi.markAsRead(id); load();
  };

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-teal-800 text-lg">Messages reçus ({items.length})</h2>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">Aucun message.</p>}
        {items.map(item => (
          <div key={item._id} className={`p-5 rounded-xl border ${item.isRead ? 'border-gray-100 bg-white' : 'border-teal-200 bg-teal-50'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-800">{item.name}</span>
                  {!item.isRead && <span className="w-2 h-2 bg-teal-500 rounded-full" />}
                </div>
                <p className="text-xs text-gray-400 mb-2">{item.email} {item.phone && `· ${item.phone}`} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.message}</p>
              </div>
              {!item.isRead && (
                <button onClick={() => markRead(item._id)} className="text-xs text-teal-600 hover:text-teal-800 font-medium flex-shrink-0 flex items-center gap-1">
                  <Check size={12} /> Lu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subscribers Tab ──────────────────────────────────────────────────────────

function SubscribersTab() {
  const [items, setItems] = useState<Subscriber[]>([]);

  const load = () => subscribersApi.getAll().then((data: Subscriber[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, current: boolean) => {
    await subscribersApi.setActive(id, !current); load();
  };

  const active = items.filter(s => s.active).length;

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-teal-800 text-lg">Abonnés ({items.length} · {active} actifs)</h2>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">Aucun abonné.</p>}
        {items.map(item => (
          <div key={item._id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.active ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="flex-1 text-sm text-gray-700">{item.email}</p>
            <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString('fr-FR')}</p>
            <button
              onClick={() => toggle(item._id, item.active)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${
                item.active ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              {item.active ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Registrations Tab ────────────────────────────────────────────────────────

type PopulatedRegistration = Omit<Registration, 'activityId'> & { activityId: string | { _id: string; title: string } };

function RegistrationsTab() {
  const [items, setItems] = useState<PopulatedRegistration[]>([]);

  const load = () => registrationsApi.getAll().then((data: PopulatedRegistration[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: Registration['status']) => {
    await registrationsApi.updateStatus(id, status); load();
  };

  const statusColors = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
  const paymentColors = { not_required: '', pending: 'bg-amber-100 text-amber-700', paid: 'bg-teal-100 text-teal-700', failed: 'bg-red-100 text-red-700' };
  const paymentLabels = { not_required: '', pending: 'Paiement en attente', paid: 'Payé', failed: 'Paiement échoué' };

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-teal-800 text-lg">Inscriptions ({items.length})</h2>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">Aucune inscription.</p>}
        {items.map(item => (
          <div key={item._id} className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400">{item.email} {item.phone && `· ${item.phone}`}</p>
              {typeof item.activityId === 'object' && <p className="text-xs text-teal-600 mt-0.5">{item.activityId.title}</p>}
            </div>
            {item.paymentStatus !== 'not_required' && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${paymentColors[item.paymentStatus]}`}>{paymentLabels[item.paymentStatus]}</span>
            )}
            {item.checkedIn && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-700">Présent</span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[item.status]}`}>{item.status}</span>
            <div className="flex gap-1">
              {item.status !== 'confirmed' && (
                <button onClick={() => updateStatus(item._id, 'confirmed')} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1 rounded-full font-medium">Confirmer</button>
              )}
              {item.status !== 'cancelled' && (
                <button onClick={() => updateStatus(item._id, 'cancelled')} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1 rounded-full font-medium">Annuler</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Donations Tab ────────────────────────────────────────────────────────────

function DonationsTab() {
  const [items, setItems] = useState<Donation[]>([]);
  useEffect(() => {
    donationsApi.getAll().then((data: Donation[]) => setItems(data));
  }, []);

  const total = items.filter(d => d.status === 'completed').reduce((s, d) => s + d.amount, 0);
  const statusColors = { pending: 'bg-amber-100 text-amber-700', completed: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-teal-800 text-lg">Dons ({items.length})</h2>
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-teal-500">Total reçu</p>
          <p className="font-bold text-teal-700">{total.toLocaleString('fr-FR')} XOF</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">Aucun don enregistré.</p>}
        {items.map(item => (
          <div key={item._id} className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 transition-all duration-200 hover:border-teal-200 hover:shadow-sm">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-800">{item.donorName ?? 'Anonyme'}</p>
              {item.donorEmail && <p className="text-xs text-gray-400">{item.donorEmail}</p>}
              <p className="text-xs text-gray-400 mt-0.5">{item.paymentMethod} · {new Date(item.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
            <p className="font-bold text-teal-700">{item.amount.toLocaleString('fr-FR')} {item.currency}</p>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[item.status]}`}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function AdminDashboard({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('activities');

  const TabContent = () => {
    switch (tab) {
      case 'activities': return <ActivitiesTab />;
      case 'news': return <NewsTab />;
      case 'gallery': return <GalleryTab />;
      case 'members': return <MembersTab />;
      case 'contacts': return <ContactsTab />;
      case 'subscribers': return <SubscribersTab />;
      case 'registrations': return <RegistrationsTab />;
      case 'donations': return <DonationsTab />;
      case 'scanner': return <ScannerTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-800 text-white px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/android-chrome-192x192.png" alt="Logo ZOBA" className="w-8 h-8 rounded-full object-cover" />
          <div>
            <p className="font-bold text-sm font-display">ZOBA — Admin</p>
            <p className="text-teal-300 text-xs">{admin.email}</p>
          </div>
        </div>
        <button onClick={onLogout} className="group flex items-center gap-2 text-teal-200 hover:text-white text-sm transition-all duration-200 active:scale-95">
          <LogOut size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" /> Déconnexion
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {TABS.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0 transition-all duration-200 ${
                    tab === id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800 hover:pl-5'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <TabContent />
          </main>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminUser } from '../../lib/api';
import {
  activitiesApi, newsApi, galleryApi, membersApi,
  contactsApi, subscribersApi, registrationsApi, donationsApi,
} from '../../lib/api';
import {
  BookOpen, Calendar, Image, Users, Mail, MessageSquare, Heart,
  LogOut, Plus, Trash2, Check, X, Edit2, Save, ClipboardList, QrCode,
  LayoutDashboard, BarChart3, Settings, Search, Bell, Menu, ChevronDown, ExternalLink, ShieldCheck
} from 'lucide-react';
import { EmptyState } from '../../components/admin/charts';
import type {
  Activity, ActivityInsert, News, NewsInsert,
  GalleryItem, GalleryInsert, Member, MemberInsert,
  Contact, Subscriber, Registration, Donation, Department
} from '../../types/database';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { imageUrl, videoPosterUrl } from '../../lib/media';
import ScannerTab from './ScannerTab';
import OverviewTab from './OverviewTab';
import StatsTab from './StatsTab';

type Tab = 'activities' | 'news' | 'gallery' | 'members' | 'contacts' | 'subscribers' | 'registrations' | 'donations' | 'scanner';


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
        <h2 className="font-bold text-[#002060] text-lg">Activités ({items.length})</h2>
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

      {items.length === 0 && !editing && <EmptyState illustration="calendar" title="Aucune activité">Créez la première avec le bouton « Ajouter ».</EmptyState>}
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
        <h2 className="font-bold text-[#002060] text-lg">Actualités ({items.length})</h2>
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

      {items.length === 0 && !editing && <EmptyState illustration="news" title="Aucune actualité">Publiez la première avec le bouton « Ajouter ».</EmptyState>}
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
  const emptyForm: GalleryInsert = { image: '', caption: '', department: 'Tous', mediaType: 'image', videoUrl: '' };
  const [form, setForm] = useState<GalleryInsert>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');

  const load = () => galleryApi.getAll().then((data: GalleryItem[]) => setItems(data));
  useEffect(() => { load(); }, []);

  const isVideo = form.mediaType === 'video';
  const canSave = isVideo ? !!form.videoUrl : !!form.image;

  const save = async () => {
    setSaveError('');
    try {
      // Vidéo : l'image affichée dans la grille est l'affiche extraite par Cloudinary.
      const payload = isVideo
        ? { ...form, image: videoPosterUrl(form.videoUrl ?? '', 1280) || form.videoUrl || '' }
        : { ...form, mediaType: 'image' as const, videoUrl: undefined };
      await galleryApi.create(payload);
      setAdding(false); setForm(emptyForm); load();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Enregistrement impossible');
    }
  };

  const del = async (id: string) => { await galleryApi.delete(id); setDeleting(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-[#002060] text-lg">Galerie ({items.length})</h2>
        <button onClick={() => setAdding(true)} className="btn-primary text-sm py-2"><Plus size={15} /> Ajouter</button>
      </div>

      {adding && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          <div className="inline-flex rounded-lg bg-white border border-teal-200 p-1 text-sm">
            {(['image', 'video'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, mediaType: type }))}
                className={`px-4 py-1.5 rounded-md font-medium transition-colors ${form.mediaType === type ? 'bg-teal-600 text-white' : 'text-teal-700 hover:bg-teal-50'}`}
              >
                {type === 'image' ? 'Photo' : 'Vidéo'}
              </button>
            ))}
          </div>
          {isVideo ? (
            <ImageUploadField
              label="Vidéo *"
              kind="video"
              value={form.videoUrl ?? ''}
              onChange={url => setForm(f => ({ ...f, videoUrl: url }))}
              folder="gallery"
            />
          ) : (
            <ImageUploadField label="Image *" value={form.image} onChange={url => setForm(f => ({ ...f, image: url }))} folder="gallery" />
          )}
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
            <button onClick={save} disabled={!canSave} className="btn-primary text-sm py-2 disabled:opacity-50"><Save size={14} /> Enregistrer</button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm py-2">Annuler</button>
          </div>
          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
        </div>
      )}

      {items.length === 0 && !adding && <EmptyState illustration="gallery" title="Galerie vide">Ajoutez vos premières photos ou vidéos avec le bouton « Ajouter ».</EmptyState>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map(item => (
          <div key={item._id} className="relative group rounded-xl overflow-hidden aspect-square bg-gray-100">
            <img src={imageUrl(item.image, 400)} alt={item.caption ?? ''} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            {item.mediaType === 'video' && (
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">VIDÉO</span>
            )}
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
        <h2 className="font-bold text-[#002060] text-lg">Bureau ({items.length})</h2>
        <button onClick={() => { setEditing(true); setEditId(null); }} className="btn-primary text-sm py-2"><Plus size={15} /> Ajouter</button>
      </div>

      {editing && (
        <div className="bg-teal-50 rounded-xl p-6 border border-teal-200 space-y-4">
          {items.length === 0 && !editing && <EmptyState illustration="people" title="Aucun membre">Présentez l'équipe en ajoutant un premier membre.</EmptyState>}
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
      <h2 className="font-bold text-[#002060] text-lg">Messages reçus ({items.length})</h2>
      <div className="space-y-3">
        {items.length === 0 && <EmptyState illustration="inbox" title="Aucun message">Les messages du formulaire de contact arriveront ici.</EmptyState>}
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
      <h2 className="font-bold text-[#002060] text-lg">Abonnés ({items.length} · {active} actifs)</h2>
      <div className="space-y-2">
        {items.length === 0 && <EmptyState illustration="newsletter" title="Aucun abonné">Les inscriptions à la newsletter s'afficheront ici.</EmptyState>}
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
      <h2 className="font-bold text-[#002060] text-lg">Inscriptions ({items.length})</h2>
      <div className="space-y-3">
        {items.length === 0 && <EmptyState illustration="people" title="Aucune inscription">Les inscriptions aux activités s'afficheront ici.</EmptyState>}
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
        <h2 className="font-bold text-[#002060] text-lg">Dons ({items.length})</h2>
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2 text-right">
          <p className="text-xs text-teal-500">Total reçu</p>
          <p className="font-bold text-teal-700">{total.toLocaleString('fr-FR')} XOF</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.length === 0 && <EmptyState illustration="donation" title="Aucun don enregistré">Les dons reçus s'afficheront ici, avec leur statut.</EmptyState>}
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

// ─── Paramètres ───────────────────────────────────────────────────────────────

function SettingsTab({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-bold text-[#002060] text-lg">Paramètres</h2>
      <div className="flex flex-wrap items-center gap-4 p-5 rounded-2xl ring-1 ring-gray-100 bg-gray-50/60">
        <div className="w-12 h-12 rounded-full bg-[#002060] text-[#F2A900] font-bold text-lg flex items-center justify-center">
          {(admin.name || admin.email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800">{admin.name || 'Administrateur'}</p>
          <p className="text-sm text-gray-500 truncate">{admin.email}</p>
        </div>
        <button onClick={onLogout} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1.5">
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
      <div className="p-5 rounded-2xl ring-1 ring-gray-100 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-600" /> Mesure d'audience</p>
        <p>
          Les visites du site sont comptées sans cookie : ni adresse IP ni identifiant ne sont enregistrés, et
          l'empreinte anonyme d'un visiteur change chaque jour. Les données sont effacées automatiquement après 13 mois.
        </p>
        <a href="/confidentialite#cookies" target="_blank" rel="noreferrer" className="inline-block text-[#1f4fbf] font-medium hover:underline">
          Voir la politique de confidentialité
        </a>
      </div>
    </div>
  );
}

// ─── Coque du tableau de bord ─────────────────────────────────────────────────

type Section = 'overview' | 'stats' | Tab | 'settings';

const NAV: { title: string; items: { id: Section; label: string; icon: React.ReactNode }[] }[] = [
  {
    title: 'Menu principal',
    items: [
      { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={18} /> },
      { id: 'activities', label: 'Activités', icon: <Calendar size={18} /> },
      { id: 'news', label: 'Actualités', icon: <BookOpen size={18} /> },
      { id: 'gallery', label: 'Galerie', icon: <Image size={18} /> },
      { id: 'donations', label: 'Dons', icon: <Heart size={18} /> },
      { id: 'registrations', label: 'Inscriptions', icon: <ClipboardList size={18} /> },
      { id: 'contacts', label: 'Messages', icon: <MessageSquare size={18} /> },
      { id: 'subscribers', label: 'Newsletter', icon: <Mail size={18} /> },
    ],
  },
  {
    title: 'Gestion',
    items: [
      { id: 'members', label: 'Bureau', icon: <Users size={18} /> },
      { id: 'scanner', label: 'Scanner de billets', icon: <QrCode size={18} /> },
      { id: 'settings', label: 'Paramètres', icon: <Settings size={18} /> },
    ],
  },
];
const ALL_ITEMS = NAV.flatMap(g => g.items);

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOutside(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function AdminDashboard({ admin, onLogout }: { admin: AdminUser; onLogout: () => void }) {
  const [section, setSection] = useState<Section>('overview');
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState<Contact[]>([]);

  // Messages non lus : pastilles de la cloche et du menu (rafraîchies à chaque changement de rubrique).
  useEffect(() => {
    contactsApi.getAll().then((data: Contact[]) => setUnread(data.filter(c => !c.isRead))).catch(() => {});
  }, [section]);

  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const closeNotif = useCallback(() => setNotifOpen(false), []);
  const closeProfile = useCallback(() => setProfileOpen(false), []);
  const searchRef = useClickOutside(closeSearch);
  const notifRef = useClickOutside(closeNotif);
  const profileRef = useClickOutside(closeProfile);

  const go = (id: Section) => {
    setSection(id);
    setDrawer(false);
    setQuery('');
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const results = query.trim() ? ALL_ITEMS.filter(i => normalize(i.label).includes(normalize(query.trim()))) : [];
  const current = ALL_ITEMS.find(i => i.id === section)!;
  const initial = (admin.name || admin.email).charAt(0).toUpperCase();

  const content = () => {
    switch (section) {
      case 'overview': return <OverviewTab onNavigate={go} />;
      case 'stats': return <StatsTab />;
      case 'activities': return <ActivitiesTab />;
      case 'news': return <NewsTab />;
      case 'gallery': return <GalleryTab />;
      case 'members': return <MembersTab />;
      case 'contacts': return <ContactsTab />;
      case 'subscribers': return <SubscribersTab />;
      case 'registrations': return <RegistrationsTab />;
      case 'donations': return <DonationsTab />;
      case 'scanner': return <ScannerTab />;
      case 'settings': return <SettingsTab admin={admin} onLogout={onLogout} />;
    }
  };

  const bare = section === 'overview' || section === 'stats';

  return (
    <div className="min-h-screen bg-[#f3f5fa] lg:p-4">
      {/* Voile du menu mobile */}
      <div
        className={`fixed inset-0 z-40 bg-[#001233]/50 backdrop-blur-[2px] transition-opacity lg:hidden ${drawer ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawer(false)}
        aria-hidden
      />

      {/* Barre latérale */}
      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-gradient-to-b from-[#002060] to-[#001540] text-white flex flex-col
          transition-transform duration-300 lg:translate-x-0 lg:inset-y-4 lg:left-4 lg:rounded-2xl lg:shadow-xl
          ${drawer ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menu d'administration"
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <img src="/android-chrome-192x192.png" alt="" className="w-10 h-10 rounded-full ring-2 ring-[#F2A900]/70 object-cover" />
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold tracking-wide leading-none">ZOBA</p>
            <p className="text-[11px] text-white/50 mt-1">Administration</p>
          </div>
          <button onClick={() => setDrawer(false)} className="lg:hidden p-1.5 text-white/60 hover:text-white" aria-label="Fermer le menu"><X size={18} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4">
          {NAV.map(group => (
            <div key={group.title}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40">{group.title}</p>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const active = section === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => go(item.id)}
                        aria-current={active ? 'page' : undefined}
                        className={`relative w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                          ${active ? 'bg-white/10 text-white font-semibold' : 'text-white/65 hover:text-white hover:bg-white/5'}`}
                      >
                        {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#F2A900]" />}
                        <span className={active ? 'text-[#F2A900]' : ''}>{item.icon}</span>
                        {item.label}
                        {item.id === 'contacts' && unread.length > 0 && (
                          <span className="ml-auto min-w-[1.25rem] h-5 px-1.5 rounded-full bg-[#F2A900] text-[#002060] text-[11px] font-bold flex items-center justify-center">{unread.length}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="m-3 p-3 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-between gap-2">
          <p className="text-xs text-white/60">Site public</p>
          <a href="/" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F2A900] text-[#002060] text-xs font-bold px-3 py-1.5 hover:brightness-105 transition">
            Ouvrir le site <ExternalLink size={12} />
          </a>
        </div>
      </aside>

      {/* Zone principale */}
      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 lg:top-4 z-30 bg-white/90 backdrop-blur lg:rounded-2xl shadow-sm ring-1 ring-gray-100 px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDrawer(true)} className="lg:hidden p-2 -ml-1 rounded-lg text-[#002060] hover:bg-gray-100" aria-label="Ouvrir le menu">
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 leading-none hidden sm:block">ZOBA · Administration</p>
            <h1 className="font-bold text-[#002060] truncate sm:mt-1">{current.label}</h1>
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* Recherche dans les rubriques */}
            <div ref={searchRef} className="relative">
              <label className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 w-32 sm:w-56 focus-within:ring-2 focus-within:ring-[#1f4fbf]/40 focus-within:bg-white transition">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && results[0]) go(results[0].id); if (e.key === 'Escape') setSearchOpen(false); }}
                  placeholder="Rechercher…"
                  aria-label="Rechercher une rubrique"
                  className="bg-transparent text-sm outline-none w-full min-w-0 placeholder-gray-400"
                />
              </label>
              {searchOpen && query.trim() && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1.5 z-10">
                  {results.length ? results.map(r => (
                    <button key={r.id} onClick={() => go(r.id)} className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <span className="text-[#1f4fbf]">{r.icon}</span>{r.label}
                    </button>
                  )) : <p className="px-3.5 py-2 text-sm text-gray-400">Aucune rubrique trouvée</p>}
                </div>
              )}
            </div>

            {/* Notifications : messages non lus */}
            <div ref={notifRef} className="relative">
              <button onClick={() => setNotifOpen(o => !o)} className="relative p-2 rounded-xl text-gray-500 hover:text-[#002060] hover:bg-gray-100 transition" aria-label={`Notifications (${unread.length} non lues)`}>
                <Bell size={19} />
                {unread.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">{unread.length > 9 ? '9+' : unread.length}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-[min(20rem,calc(100vw-1.5rem))] bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-10 overflow-hidden">
                  <p className="px-4 py-3 text-sm font-semibold text-[#002060] border-b border-gray-100">Messages non lus</p>
                  {unread.length ? (
                    <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {unread.slice(0, 5).map(m => (
                        <li key={m._id}>
                          <button onClick={() => { setNotifOpen(false); go('contacts'); }} className="w-full text-left px-4 py-3 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-800 truncate">{m.name}</p>
                            <p className="text-xs text-gray-500 line-clamp-1">{m.message}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="px-4 py-6 text-sm text-gray-400 text-center">Tout est lu.</p>}
                </div>
              )}
            </div>

            {/* Profil */}
            <div ref={profileRef} className="relative">
              <button onClick={() => setProfileOpen(o => !o)} className="flex items-center gap-2 p-1 sm:pr-2 rounded-xl hover:bg-gray-100 transition" aria-label="Profil">
                <span className="w-8 h-8 rounded-full bg-[#002060] text-[#F2A900] font-bold text-sm flex items-center justify-center">{initial}</span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-10 py-1.5">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{admin.name || 'Administrateur'}</p>
                    <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                  </div>
                  <button onClick={() => { setProfileOpen(false); go('settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Settings size={15} /> Paramètres</button>
                  <button onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50"><LogOut size={15} /> Déconnexion</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-5 lg:px-0 py-5 lg:pt-6">
          {bare ? content() : (
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 sm:p-6">{content()}</div>
          )}
        </main>
      </div>
    </div>
  );
}

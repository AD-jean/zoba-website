import { useRef, useState } from 'react';
import { UploadCloud, Loader2, Film } from 'lucide-react';
import { uploadsApi, uploadVideoDirect, MAX_VIDEO_BYTES } from '../../lib/api';
import { imageUrl, videoPosterUrl } from '../../lib/media';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'members' | 'activities' | 'news' | 'gallery';
  /** 'video' : téléversement direct vers Cloudinary (gros fichiers), galerie uniquement. */
  kind?: 'image' | 'video';
}

export default function ImageUploadField({ label, value, onChange, folder, kind = 'image' }: ImageUploadFieldProps) {
  const isVideo = kind === 'video';
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    if (isVideo && file.size > MAX_VIDEO_BYTES) {
      setError('Vidéo trop lourde (100 Mo maximum). Raccourcissez-la ou exportez-la en 1080p.');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const { url } = isVideo
        ? await uploadVideoDirect(file, 'gallery', setProgress)
        : await uploadsApi.upload(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de televersement');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="sm:col-span-2">
      <label className="text-xs text-gray-600 font-medium mb-1 block">{label}</label>
      <div className="flex gap-3 items-start">
        {value && (
          <div className="relative flex-shrink-0">
            <img
              src={isVideo ? videoPosterUrl(value, 200) || undefined : imageUrl(value, 200)}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 bg-gray-100"
            />
            {isVideo && <Film size={14} className="absolute bottom-1 right-1 text-white drop-shadow" />}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            className="input-field"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={isVideo ? 'https://res.cloudinary.com/... ou glissez une vidéo ci-dessous' : 'https://... ou glissez une image ci-dessous'}
          />
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-3 text-sm cursor-pointer transition-colors duration-200
              ${dragOver ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-500 hover:border-teal-400 hover:bg-teal-50/50'}`}
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Televersement...{isVideo && ` ${progress} %`}
              </>
            ) : (
              <>
                <UploadCloud size={16} /> {isVideo ? 'Glissez une vidéo (MP4, MOV, WebM — 100 Mo max) ou cliquez' : 'Glissez une image ou cliquez pour parcourir'}
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={isVideo ? 'video/mp4,video/quicktime,video/webm' : 'image/jpeg,image/png,image/webp,image/gif'}
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>
    </div>
  );
}

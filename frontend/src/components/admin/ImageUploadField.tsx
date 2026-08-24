import { useRef, useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { uploadsApi } from '../../lib/api';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: 'members' | 'activities' | 'news' | 'gallery';
}

export default function ImageUploadField({ label, value, onChange, folder }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const { url } = await uploadsApi.upload(file, folder);
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
          <img src={value} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-gray-200" />
        )}
        <div className="flex-1 space-y-2">
          <input
            className="input-field"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="https://... ou glissez une image ci-dessous"
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
                <Loader2 size={16} className="animate-spin" /> Televersement...
              </>
            ) : (
              <>
                <UploadCloud size={16} /> Glissez une image ou cliquez pour parcourir
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
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

import { v2 as cloudinary } from 'cloudinary';
import { AppError } from '../utils/AppError';

let configured = false;

const configure = (): void => {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new AppError(500, "Upload d'image indisponible (Cloudinary non configure)");
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  configured = true;
};

export const uploadImage = async (buffer: Buffer, folder: string): Promise<string> => {
  configure();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `zoba/${folder}`, resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(new AppError(502, "Impossible d'televerser l'image"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Doit rester identique a VIDEO_TRANSFORMATION cote frontend (src/lib/media.ts) : la version
// pre-generee a l'upload (eager) est exactement celle que le site demande ensuite, donc
// servie instantanement par le CDN au lieu d'etre encodee a la premiere lecture.
export const VIDEO_DELIVERY_TRANSFORMATION = 'c_limit,w_1280,q_auto,vc_h264/mp4';

export interface SignedUploadParams {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  resourceType: 'image' | 'video';
  eager?: string;
  eagerAsync?: boolean;
}

/**
 * Signature pour un televersement direct navigateur -> Cloudinary : les gros fichiers
 * (videos) ne transitent pas par notre API (limite memoire/temps de l'hebergeur), et la
 * cle secrete ne quitte jamais le serveur. La signature fige le dossier et les options.
 */
export const createSignedUpload = (folder: string, resourceType: 'image' | 'video'): SignedUploadParams => {
  configure();
  const timestamp = Math.round(Date.now() / 1000);
  const fullFolder = `zoba/${folder}`;
  const params: Record<string, string | number | boolean> = { folder: fullFolder, timestamp };
  if (resourceType === 'video') {
    params.eager = VIDEO_DELIVERY_TRANSFORMATION;
    params.eager_async = true;
  }
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET as string);
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    timestamp,
    signature,
    folder: fullFolder,
    resourceType,
    ...(resourceType === 'video' ? { eager: VIDEO_DELIVERY_TRANSFORMATION, eagerAsync: true } : {})
  };
};

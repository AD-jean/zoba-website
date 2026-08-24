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

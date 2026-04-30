import { v2 as cloudinary } from 'cloudinary';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import crypto from 'crypto';

// ─── Cloudinary Setup ─────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true,
});

// ─── S3 Setup ─────────────────────────────────────────────────────────────────
const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface UploadResult {
  url: string;
  publicId: string;
  provider: 'cloudinary' | 's3';
  width?: number;
  height?: number;
}

export async function uploadFile(
  fileBuffer: Buffer,
  mimeType: string,
  originalName: string,
  folder = 'contentnest'
): Promise<UploadResult> {
  if (config.storageProvider === 's3') {
    return uploadToS3(fileBuffer, mimeType, originalName, folder);
  }
  return uploadToCloudinary(fileBuffer, mimeType, folder);
}

async function uploadToCloudinary(buffer: Buffer, mimeType: string, folder: string): Promise<UploadResult> {
  const resourceType = mimeType.startsWith('video') ? 'video' : mimeType === 'application/pdf' ? 'raw' : 'image';

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) { reject(error || new Error('Cloudinary upload failed')); return; }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          provider: 'cloudinary',
          width: result.width,
          height: result.height,
        });
      }
    );
    uploadStream.end(buffer);
  });
}

async function uploadToS3(buffer: Buffer, mimeType: string, originalName: string, folder: string): Promise<UploadResult> {
  const ext = originalName.split('.').pop() || '';
  const key = `${folder}/${crypto.randomUUID()}.${ext}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  const url = `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
  return { url, publicId: key, provider: 's3' };
}

export async function deleteFile(publicId: string, provider: 'cloudinary' | 's3'): Promise<void> {
  if (provider === 'cloudinary') {
    await cloudinary.uploader.destroy(publicId);
  } else {
    await s3Client.send(new DeleteObjectCommand({ Bucket: config.aws.bucket, Key: publicId }));
  }
}

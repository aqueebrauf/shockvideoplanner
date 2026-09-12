import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

export function getR2Config() {
  return {
    accountId: requireEnv('R2_ACCOUNT_ID'),
    accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
    bucket: requireEnv('R2_BUCKET_NAME'),
    publicUrl: requireEnv('R2_PUBLIC_URL').replace(/\/$/, ''),
  };
}

export function getR2Client() {
  const { accountId, accessKeyId, secretAccessKey } = getR2Config();
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function buildStorageKey({ goalId, planId, assetType, iteration, ext }) {
  const safeExt = ext.replace(/^\./, '');
  return `goals/${goalId}/plans/${planId}/${assetType}/iter-${iteration}.${safeExt}`;
}

export function buildPublicUrl(storageKey) {
  const { publicUrl } = getR2Config();
  return `${publicUrl}/${storageKey}`;
}

export async function createPresignedUploadUrl({ storageKey, contentType }) {
  const client = getR2Client();
  const { bucket } = getR2Config();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
  return {
    uploadUrl,
    storageKey,
    publicUrl: buildPublicUrl(storageKey),
  };
}

export async function uploadBufferToR2({ storageKey, buffer, contentType }) {
  const client = getR2Client();
  const { bucket } = getR2Config();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return {
    storageKey,
    publicUrl: buildPublicUrl(storageKey),
  };
}

export async function deleteFromR2(storageKey) {
  if (!storageKey?.trim()) return;
  const client = getR2Client();
  const { bucket } = getR2Config();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })
  );
}

export function extensionFromMime(mimeType) {
  switch (mimeType) {
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'bin';
  }
}

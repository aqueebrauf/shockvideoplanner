import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ENV_KEYS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

function assertR2Env() {
  const missing = R2_ENV_KEYS.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `Missing R2 env: ${missing.join(', ')}. Add them in Vercel → Settings → Environment Variables (Production + Preview), then redeploy.`
    );
  }
}

export function getR2Config() {
  assertR2Env();
  return {
    accountId: process.env.R2_ACCOUNT_ID.trim(),
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
    bucket: process.env.R2_BUCKET_NAME.trim(),
    publicUrl: process.env.R2_PUBLIC_URL.trim().replace(/\/$/, ''),
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

import { config, higgsfield } from '@higgsfield/client/v2';

const credentials = process.env.HF_CREDENTIALS;
if (!credentials) {
  console.error('HF_CREDENTIALS is missing. Add it to .env.local as key-id:key-secret, then run this script again.');
  process.exit(1);
}

config({ credentials });

const result = await higgsfield.subscribe('bytedance/seedance-2.5/text-to-video', {
  input: {
    prompt: 'A cinematic scene at sunset',
    duration: 5,
    resolution: '720p',
    aspect_ratio: '16:9',
    output_format: 'mp4',
    generate_audio: true,
  },
  withPolling: true,
});

const status = result?.status;
if (status === 'completed') {
  const url = result?.video?.url;
  if (!url) {
    console.error('Seedance completed without a video URL.');
    process.exit(1);
  }
  console.log(url);
  process.exit(0);
}

if (status === 'failed' || status === 'canceled' || status === 'nsfw') {
  console.error(`Seedance request ${status}.`);
  process.exit(1);
}

console.error(`Seedance request ended with status ${status ?? 'unknown'}.`);
process.exit(1);

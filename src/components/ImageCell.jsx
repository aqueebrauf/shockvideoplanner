import { useRef, useState } from 'react';
import { compressImage } from '../lib/compressImage';

export default function ImageCell({ image, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file?.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } catch {
      setError('Could not load image');
    } finally {
      setBusy(false);
    }
  }

  function openPicker() {
    inputRef.current?.click();
  }

  if (!image) {
    return (
      <div className="image-cell">
        <button type="button" className="btn-ghost" onClick={openPicker} disabled={busy}>
          {busy ? 'Uploading…' : 'Add image'}
        </button>
        {error && <span className="cell-error">{error}</span>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) handleFile(file);
          }}
        />
      </div>
    );
  }

  return (
    <div className="image-cell image-cell--filled">
      <img src={image} alt="Screen example" className="image-cell__preview" />
      <div className="image-cell__actions">
        <button type="button" className="btn-ghost" onClick={openPicker} disabled={busy}>
          Replace
        </button>
        <button type="button" className="btn-ghost btn-danger" onClick={() => onChange(null)}>
          Remove
        </button>
      </div>
      {error && <span className="cell-error">{error}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';

interface AvatarUploaderProps {
  onCropped: (file: File) => void;
}

// Simple square crop tool using canvas; keeps code lightweight without extra deps
const AvatarUploader: React.FC<AvatarUploaderProps> = ({ onCropped }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [crop, setCrop] = useState({ x: 50, y: 50, size: 200 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Render crop preview onto canvas
  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !imgRef.current) return;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = 256; // output size
    canvas.width = size;
    canvas.height = size;

    // draw circular mask output
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const sx = crop.x * scaleX;
    const sy = crop.y * scaleY;
    const sSize = crop.size * Math.max(scaleX, scaleY);
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
    ctx.restore();
  }, [imageSrc, crop]);

  const handleMouseDown = () => setDragging(true);
  const handleMouseUp = () => setDragging(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = (e.target as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left - crop.size / 2;
    const y = e.clientY - rect.top - crop.size / 2;
    setCrop(prev => ({ ...prev, x: Math.max(0, Math.min(x, rect.width - prev.size)), y: Math.max(0, Math.min(y, rect.height - prev.size)) }));
  };

  const exportCropped = async () => {
    if (!canvasRef.current) return;
    const blob: Blob | null = await new Promise(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
    if (!blob) return;
    const file = new File([blob], 'avatar.png', { type: 'image/png' });
    onCropped(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Profile picture</label>
      <input type="file" accept="image/*" onChange={onFileChange} className="block w-full text-sm" />
      {imageSrc && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="relative w-full h-72 bg-gray-100 rounded-xl overflow-hidden select-none cursor-move"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            <img ref={imgRef} src={imageSrc} alt="to crop" className="w-full h-full object-contain" />
            <div
              style={{ left: crop.x, top: crop.y, width: crop.size, height: crop.size }}
              className="absolute border-2 border-lime-500/70 rounded-md bg-lime-500/10"
            />
          </div>
          <div className="flex flex-col items-center">
            <canvas ref={canvasRef} className="rounded-full shadow" />
            <button type="button" onClick={exportCropped} className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Use this avatar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUploader;

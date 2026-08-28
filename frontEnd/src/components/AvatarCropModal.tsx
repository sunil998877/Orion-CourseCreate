import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Camera, Check } from 'lucide-react';
interface AvatarCropModalProps {
    open: boolean;
    onClose: () => void;
    onCropped: (file: File) => void;
}
const AvatarCropModal: React.FC<AvatarCropModalProps> = ({ open, onClose, onCropped }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [crop, setCrop] = useState({ x: 40, y: 40, size: 220 });
    const imgRef = useRef<HTMLImageElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        if (!open) {
            setImageSrc(null);
            setCrop({ x: 40, y: 40, size: 220 });
        }
    }, [open]);
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result as string);
        reader.readAsDataURL(file);
    };
    useEffect(() => {
        if (!imageSrc || !canvasRef.current || !imgRef.current)
            return;
        const img = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const size = 256;
        canvas.width = size;
        canvas.height = size;
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
        if (!dragging)
            return;
        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        const x = e.clientX - rect.left - crop.size / 2;
        const y = e.clientY - rect.top - crop.size / 2;
        setCrop(prev => ({ ...prev, x: Math.max(0, Math.min(x, rect.width - prev.size)), y: Math.max(0, Math.min(y, rect.height - prev.size)) }));
    };
    const exportCropped = async () => {
        if (!canvasRef.current)
            return;
        const blob: Blob | null = await new Promise(resolve => canvasRef.current!.toBlob(resolve, 'image/png'));
        if (!blob)
            return;
        const file = new File([blob], 'avatar.png', { type: 'image/png' });
        onCropped(file);
        onClose();
    };
    if (!open)
        return null;
    return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl overflow-hidden bg-[#0f1115] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(132,204,22,0.1)] flex flex-col">

        <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 flex flex-col h-full">

          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-500/10 rounded-lg border border-lime-500/20">
                <Camera className="w-5 h-5 text-lime-400"/>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Customize Avatar</h3>
                <p className="text-xs text-lime-400/60 uppercase tracking-widest font-medium">Identity Profile v1.0</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white group">
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"/>
            </button>
          </div>

          <div className="p-8 space-y-6">
            {!imageSrc ? (<div className="relative group">
                <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"/>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 group-hover:border-lime-500/30 transition-all bg-white/[0.02]">
                  <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500">
                    <Upload className="w-8 h-8 text-lime-400"/>
                  </div>
                  <div className="text-center">
                    <p className="text-white font-medium">Click or drag to upload</p>
                    <p className="text-sm text-white/40 mt-1">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                </div>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Crop Area</span>
                    <button onClick={() => setImageSrc(null)} className="text-xs text-lime-400 hover:text-lime-300 transition-colors uppercase tracking-widest font-bold">
                      Change Image
                    </button>
                  </div>
                  <div className="relative w-full aspect-square bg-black border border-white/5 rounded-2xl overflow-hidden select-none cursor-move group" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}>
                    <img ref={imgRef} src={imageSrc} alt="to crop" className="w-full h-full object-contain opacity-50 group-hover:opacity-70 transition-opacity"/>
                    <div style={{
                left: crop.x,
                top: crop.y,
                width: crop.size,
                height: crop.size,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
            }} className="absolute border-2 border-lime-500 rounded-full z-10">
                      <div className="absolute inset-0 bg-transparent rounded-full border border-white/20"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 flex flex-col items-center justify-center h-full">
                  <div className="text-center">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-4">Preview</span>
                    <div className="relative p-1 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 shadow-[0_0_20px_rgba(132,204,22,0.2)]">
                      <canvas ref={canvasRef} className="rounded-full bg-[#0f1115] w-48 h-48"/>
                    </div>
                  </div>

                  <div className="w-full pt-6 border-t border-white/5 flex flex-col gap-3">
                    <button type="button" onClick={exportCropped} className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(132,204,22,0.3)] flex items-center justify-center gap-2">
                      <Check className="w-4 h-4"/>
                      Save Changes
                    </button>
                    <button onClick={onClose} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all border border-white/10">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>);
};
export default AvatarCropModal;

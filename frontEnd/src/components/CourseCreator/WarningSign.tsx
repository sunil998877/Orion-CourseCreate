import React from 'react';
import { AlertTriangle } from 'lucide-react';

const WarningSign: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-amber-400 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>{children || 'AI-generated content may contain mistakes. Please verify it before use.'}</div>
    </div>
);

export default WarningSign;

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !isUpdating) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 px-3.5 py-2 text-xs font-semibold text-amber-200 shadow-2xl animate-in fade-in slide-in-from-bottom-3" dir="rtl">
      {!isOnline ? (
        <>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <WifiOff className="w-4 h-4 text-amber-400" />
          <span>وضع عدم الاتصال (Offline First) - العرض من التخزين المحلي</span>
        </>
      ) : (
        <>
          <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-spin" />
          <RefreshCw className="w-4 h-4 text-teal-400 animate-spin" />
          <span>جاري تحديث البيانات المحلية...</span>
        </>
      )}
    </div>
  );
};

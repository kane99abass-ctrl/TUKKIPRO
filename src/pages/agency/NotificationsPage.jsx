import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext.jsx';
import { Bell, CheckCheck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { notifications, markAllNotificationsAsRead } = useData();
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMarkAll = () => {
    markAllNotificationsAsRead();
    showToast('Toutes les notifications sont désormais marquées comme lues.');
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-white/10 text-xs flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-title text-slate-900">Notifications & Échéances</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Flux d'alertes en temps réel : time-limits de vols, visas délivrés, acomptes reçus et départs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAll}
            className="fluent-btn px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-[#0F766E] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Liste des Notifications */}
      {notifications.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-700">Aucune notification</h3>
          <p className="text-xs text-slate-400 mt-1">Vous êtes à jour dans le suivi de tous vos dossiers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((al) => (
            <div 
              key={al.id} 
              className={`p-4 rounded-2xl border shadow-xs flex items-start justify-between gap-4 transition-all ${
                al.unread 
                  ? 'bg-white border-teal-200/90 ring-1 ring-teal-100 shadow-sm' 
                  : 'bg-slate-50/70 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono mt-0.5 shrink-0 ${
                  al.type === 'URGENT' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                  al.type === 'VISA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                  al.type === 'PAIEMENT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  al.type === 'CLIENT' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {al.type}
                </span>

                <div>
                  <h3 className={`text-xs ${al.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                    {al.title}
                  </h3>
                  {al.dossier && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Référence : <strong className="text-slate-700">{al.dossier}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-slate-400">{al.time}</span>
                {al.unread && (
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

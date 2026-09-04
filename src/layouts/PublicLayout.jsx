import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PublicLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const openModal = () => setIsModalOpen(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0D0D12] text-[#FAF8F5] selection:bg-[#C9A84C] selection:text-[#0D0D12]">
      <Outlet context={{ openModal }} />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="luxury-container max-w-md w-full p-6 sm:p-8 relative bg-[#12121A] border border-[#C9A84C]/40">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            {submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-[#C9A84C] mx-auto mb-3" />
                <h3 className="font-bold text-lg text-white mb-1">Accès Initialisé</h3>
                <p className="text-xs text-slate-300">Votre agence a été enregistrée. Vos accès vous parviennent par WhatsApp.</p>
              </div>
            ) : (
              <div>
                <h3 className="font-bold text-lg text-white mb-1">Essai Gratuit 14 Jours</h3>
                <p className="text-xs text-slate-400 mb-4">Accédez à l'orchestration complète TukkiPro sans engagement.</p>
                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Nom de l'agence *</label>
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="Ex: Sahel Horizon Voyages"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Téléphone WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-magnetic w-full py-3 rounded-full bg-[#C9A84C] text-[#0D0D12] font-bold text-xs uppercase"
                  >
                    Activer mon accès
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

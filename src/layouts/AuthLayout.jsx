import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      {/* Halo d'ambiance doux */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-200/40 via-amber-100/30 to-rose-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Logo & retour accueil */}
      <div className="mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F766E] to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Tukki<span className="text-[#F59E0B]">Pro</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500 mt-2">
          Le logiciel de gestion des agences de voyages en Afrique
        </p>
      </div>

      {/* Carte centrale dépolie */}
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/90 rounded-[28px] p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        <Outlet />
      </div>

      {/* Footer minimaliste auth */}
      <div className="mt-8 text-center text-xs text-slate-500 flex items-center gap-4">
        <Link to="/" className="hover:text-[#0F766E] transition-colors">Retour à l'accueil</Link>
        <span>•</span>
        <Link to="/tarifs" className="hover:text-[#0F766E] transition-colors">Tarifs & Offres</Link>
        <span>•</span>
        <a href="mailto:support@tukkipro.com" className="hover:text-[#0F766E] transition-colors">Besoin d'aide ?</a>
      </div>

    </div>
  );
}

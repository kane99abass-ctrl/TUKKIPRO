import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export default function PricingPage() {
  const context = useOutletContext();
  const openModal = context?.openModal || (() => {});

  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] block mb-2">TARIFICATION TRANSPARENTE</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-title text-slate-900 tracking-tight mb-4">
          Un abonnement rentabilisé dès le premier voyage
        </h1>
        <p className="text-slate-600 text-lg">
          Tous nos forfaits incluent 14 jours d'essai gratuit, sans carte bancaire et sans engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {/* Essentiel */}
        <div className="glass-pill-card p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">AGENCE INDÉPENDANTE</span>
            <h3 className="text-2xl font-bold font-title text-slate-900 mb-2">Essentiel</h3>
            <p className="text-slate-500 text-xs mb-6">Idéal pour les agences démarrant leur numérisation</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-slate-900">35 000</span>
              <span className="text-xs font-semibold text-slate-500"> FCFA / mois</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Jusqu'à 3 agents de comptoir</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> 150 dossiers par mois</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Suivi des échéances et alertes</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Factures & reçus de paiement</li>
            </ul>
          </div>
          <button onClick={openModal} className="fluent-btn w-full py-3.5 rounded-xl border-2 border-slate-800 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-sm text-center">
            Démarrer l'essai gratuit
          </button>
        </div>

        {/* Pro */}
        <div className="glass-pill-card p-8 flex flex-col justify-between relative border-2 border-amber-400 md:-translate-y-3 shadow-xl" style="background: rgba(255, 255, 255, 0.94);">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F59E0B] text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
            Le plus recommandé
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-2">AGENCE EN CROISSANCE</span>
            <h3 className="text-2xl font-bold font-title text-slate-900 mb-2">Pro</h3>
            <p className="text-slate-500 text-xs mb-6">Pour piloter toute l'activité et automatiser les relances</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-[#0F766E]">75 000</span>
              <span className="text-xs font-semibold text-slate-500"> FCFA / mois</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-700 mb-8 font-medium">
              <li className="flex items-center gap-2"><span className="text-[#F59E0B] font-bold">✓</span> Jusqu'à 10 agents de comptoir</li>
              <li className="flex items-center gap-2"><span className="text-[#F59E0B] font-bold">✓</span> Dossiers de voyage ILLIMITÉS</li>
              <li className="flex items-center gap-2"><span className="text-[#F59E0B] font-bold">✓</span> Rappels automatiques WhatsApp clients</li>
              <li className="flex items-center gap-2"><span className="text-[#F59E0B] font-bold">✓</span> Suivi des marges et commissions</li>
              <li className="flex items-center gap-2"><span className="text-[#F59E0B] font-bold">✓</span> Support WhatsApp prioritaire 7j/7</li>
            </ul>
          </div>
          <button onClick={openModal} className="fluent-btn w-full py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-sm text-center shadow-md">
            Démarrer l'essai 14 jours
          </button>
        </div>

        {/* Entreprise */}
        <div className="glass-pill-card p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">RÉSEAUX & VOYAGISTES</span>
            <h3 className="text-2xl font-bold font-title text-slate-900 mb-2">Entreprise</h3>
            <p className="text-slate-500 text-xs mb-6">Réseaux multi-pays, filiales et voyagistes</p>
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-900">Sur mesure</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 mb-8">
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Succursales et agents illimités</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Synchronisation directe GDS Amadeus & Sabre</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Formation sur mesure pour vos équipes</li>
              <li className="flex items-center gap-2"><span className="text-[#0F766E] font-bold">✓</span> Account manager dédié</li>
            </ul>
          </div>
          <button onClick={openModal} className="fluent-btn w-full py-3.5 rounded-xl border-2 border-slate-800 hover:bg-slate-900 hover:text-white text-slate-800 font-bold text-sm text-center">
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  );
}

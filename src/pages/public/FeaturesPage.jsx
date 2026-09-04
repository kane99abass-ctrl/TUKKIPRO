import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';

export default function FeaturesPage() {
  const context = useOutletContext();
  const openModal = context?.openModal || (() => {});

  const features = [
    {
      title: 'Fiche Voyageur Centralisée',
      description: 'Passeports scannés, billets d’avion, réservations d’hôtels et justificatifs réunis en un seul endroit.',
      icon: '🗂️'
    },
    {
      title: 'Suivi Consulaire & Visas',
      description: 'Gestion des dépôts de visas, délais estimés, alertes de retrait et notification immédiate du voyageur.',
      icon: '🛂'
    },
    {
      title: 'Vigilance Time-Limits GDS',
      description: 'Surveillance proactive des options tarifaires aériennes pour éliminer définitivement les pénalités d’annulation.',
      icon: '⏰'
    },
    {
      title: 'Paiements & Multi-devises',
      description: 'Facturation claire en FCFA, Euro et Dollar. Enregistrement des acomptes Orange Money, Wave ou virements.',
      icon: '💳'
    },
    {
      title: 'Multi-agents & Rôles',
      description: 'Chaque collaborateur dispose de ses accès avec historique complet de chaque modification de dossier.',
      icon: '👥'
    },
    {
      title: 'Rappels WhatsApp Automatisés',
      description: 'Envoi d’itinéraires, confirmations de vols et rappels de solde directement sur le WhatsApp de vos clients.',
      icon: '💬'
    }
  ];

  return (
    <div className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] block mb-2">FONCTIONNALITÉS COMPLÈTES</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-title text-slate-900 tracking-tight mb-4">
          L'outil métier taillé pour l'agence de voyages moderne
        </h1>
        <p className="text-slate-600 text-lg">
          Découvrez tous les modules pensés pour simplifier le travail de vos agents et rassurer vos clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feat, idx) => (
          <div key={idx} className="glass-pill-card p-8 flex flex-col justify-between">
            <div>
              <div className="text-3xl mb-4">{feat.icon}</div>
              <h3 className="text-xl font-bold font-title text-slate-900 mb-2">{feat.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feat.description}</p>
            </div>
            <div className="pt-4 mt-6 border-t border-slate-200/60 text-xs font-semibold text-[#0F766E]">
              Inclus dans toutes les offres
            </div>
          </div>
        ))}
      </div>

      <div className="glass-pill-card p-10 text-center max-w-2xl mx-auto bg-white/90">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Prêt à tester TukkiPro dans votre agence ?</h2>
        <p className="text-slate-600 text-sm mb-6">Commencez dès aujourd’hui avec notre période d'essai de 14 jours sans engagement.</p>
        <button onClick={openModal} className="fluent-btn px-8 py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5751] text-white font-bold text-sm">
          Démarrer l'essai gratuit
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Plane, ShieldCheck, CreditCard, CheckCircle2, 
  ArrowUpRight, ArrowRight, Clock, Users, FileText, ChevronRight,
  RefreshCw, Check, Globe, Lock, Activity, Eye, Play, Pause, ChevronDown,
  Settings, Database, Server, Key, EyeOff
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  // Modal state for CTA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [agencyPhone, setAgencyPhone] = useState('');
  const [agencyEmail, setAgencyEmail] = useState('');

  // Currency toggle (FCFA / EUR)
  const [currency, setCurrency] = useState('XOF'); // 'XOF' or 'EUR'

  // Navbar morph state
  const [scrolled, setScrolled] = useState(false);

  // References for GSAP
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroCtaRef = useRef(null);
  const manifestoRef = useRef(null);
  const stackRef = useRef(null);

  /* ================= 1. CARTE FONCTIONNALITÉ 1 : MÉLANGEUR DIAGNOSTIQUE ================= */
  const [mixerCards, setMixerCards] = useState([
    {
      id: 1,
      ref: 'TK-9021',
      title: 'Vol Air France AF718 Paris CDG ✈ Dakar DSS',
      category: 'Ligne Régulière',
      meta: '18 Passagers Classe Affaires',
      status: '✓ Billets émis & PNR Synchronisé',
      statusBadge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
      pnr: 'AF-774902',
      amount: '14 250 000 XOF'
    },
    {
      id: 2,
      ref: 'TK-9022',
      title: 'Groupe Pèlerinage Omra Al-Badr',
      category: 'Affrètement Groupe',
      meta: '54 Pèlerins • Djeddah & Médine',
      status: '⏳ Visas Consulat OK • Acompte 85%',
      statusBadge: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
      pnr: 'SV-991823',
      amount: '68 400 000 XOF'
    },
    {
      id: 3,
      ref: 'TK-9023',
      title: 'Affrètement Falcon 7X Abidjan ✈ Genève',
      category: 'Aviation d’Affaires VIP',
      meta: '6 Voyageurs Corporate',
      status: '● Clearance Espace Aérien Validée',
      statusBadge: 'bg-[#C9A84C]/20 text-[#E3C878] border-[#C9A84C]/40',
      pnr: 'PRV-1104',
      amount: '42 000 000 XOF'
    }
  ]);
  const [isMixerPaused, setIsMixerPaused] = useState(false);

  // Cycle array.unshift(array.pop()) every 3s
  useEffect(() => {
    if (isMixerPaused) return;
    const interval = setInterval(() => {
      setMixerCards(prev => {
        const next = [...prev];
        const last = next.pop();
        if (last) next.unshift(last);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isMixerPaused]);

  /* ================= 2. CARTE FONCTIONNALITÉ 2 : MACHINE À ÉCRIRE TÉLÉMÉTRIE ================= */
  const telemetryLogs = [
    '> [OCR_SCAN] Passeport SN-9948210 validé (Validité 2029 • ICAO 9303 OK)',
    '> [CONSULAT_FR] Dépôt Visa Schengen #TK-7749 instruit avec succès',
    '> [BIOMÉTRIE] Empreintes biométriques VFS Dakar validées pour M. Diaw',
    '> [ALERT_EXP] 14 passeports approchant J-180 : Rappel WhatsApp transmis',
    '> [AMADEUS_GDS] Billet émis 057-229104921 — Confirmation instantanée'
  ];
  const [logIndex, setLogIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentFull = telemetryLogs[logIndex];
    let charIndex = 0;
    setTypedText('');
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      charIndex++;
      setTypedText(currentFull.slice(0, charIndex));
      if (charIndex >= currentFull.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        setTimeout(() => {
          setLogIndex(prev => (prev + 1) % telemetryLogs.length);
        }, 2200);
      }
    }, 35);

    return () => clearInterval(typeInterval);
  }, [logIndex]);

  /* ================= 3. CARTE FONCTIONNALITÉ 3 : PLANIFICATEUR PROTOCOLE CURSEUR ================= */
  const daysOfWeek = [
    { short: 'L', name: 'Lun', active: false },
    { short: 'M', name: 'Mar', active: false },
    { short: 'M', name: 'Mer', active: false },
    { short: 'J', name: 'Jeu', active: false },
    { short: 'V', name: 'Ven', active: true },
    { short: 'S', name: 'Sam', active: false },
    { short: 'D', name: 'Dim', active: false }
  ];
  const [cursorPhase, setCursorPhase] = useState(0); 
  // 0: enter, 1: click Friday, 2: move to Save, 3: saved flash

  useEffect(() => {
    const sequence = setInterval(() => {
      setCursorPhase(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(sequence);
  }, []);

  /* ================= SCROLL LISTENER POUR NAVBAR ================= */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ================= GSAP ANIMATIONS & SCROLLTRIGGERS ================= */
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance Animations
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl.fromTo(
        heroTitleRef.current?.children || [],
        { y: 45, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 1.1 }
      )
      .fromTo(
        heroSubtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9 },
        '-=0.7'
      )
      .fromTo(
        heroCtaRef.current,
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );

      // 2. Section Manifeste Revelation
      if (manifestoRef.current) {
        gsap.fromTo(
          manifestoRef.current.querySelectorAll('.reveal-text'),
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.18,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // 3. Section Protocole Sticky Stacking
      const cards = gsap.utils.toArray('.protocol-stack-card');
      if (cards.length > 0 && stackRef.current) {
        cards.forEach((card, index) => {
          if (index < cards.length - 1) {
            ScrollTrigger.create({
              trigger: card,
              start: 'top top+=90',
              endTrigger: stackRef.current,
              end: 'bottom bottom',
              pin: true,
              pinSpacing: false,
              scrub: 0.5,
              onUpdate: (self) => {
                const progress = self.progress;
                if (progress > 0.1) {
                  gsap.to(card, {
                    scale: 1 - progress * 0.12,
                    filter: `blur(${progress * 16}px)`,
                    opacity: 1 - progress * 0.55,
                    duration: 0.1,
                    overwrite: 'auto'
                  });
                } else {
                  gsap.to(card, {
                    scale: 1,
                    filter: 'blur(0px)',
                    opacity: 1,
                    duration: 0.1,
                    overwrite: 'auto'
                  });
                }
              }
            });
          }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // CTA Submit Handler
  const handleModalSubmit = (e) => {
    e.preventDefault();
    setModalSubmitted(true);
    setTimeout(() => {
      setModalSubmitted(false);
      setIsModalOpen(false);
    }, 2800);
  };

  return (
    <div ref={containerRef} className="bg-[#0D0D12] text-[#FAF8F5] min-h-screen relative selection:bg-[#C9A84C] selection:text-[#0D0D12]">

      {/* OVERLAY DE BRUIT SVG GLOBAL OBLIGATOIRE (Opacité 0.05) */}
      <svg className="noise-overlay" aria-hidden="true">
        <filter id="globalNoiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#globalNoiseFilter)" />
      </svg>

      {/* ================= COMPOSANT A. NAVBAR — "L'ÎLE FLOTTANTE" ================= */}
      <nav 
        className={`fixed top-5 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl px-5 sm:px-7 py-3 sm:py-3.5 rounded-full transition-all duration-500 flex items-center justify-between ${
          scrolled 
            ? 'bg-[#0D0D12]/80 backdrop-blur-2xl border border-[#C9A84C]/35 shadow-[0_12px_40px_rgba(0,0,0,0.65)]' 
            : 'bg-transparent border border-white/10 text-[#FAF8F5]'
        }`}
      >
        {/* Logo TukkiPro comme sur le dashboard */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0F766E] to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            T
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              Tukki<span className="text-[#F59E0B]">Pro</span>
            </span>
            <span className="text-[10px] text-slate-300 font-medium -mt-0.5">Espace Agence</span>
          </div>
        </Link>

        {/* Liens de navigation */}
        <div className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wider text-slate-300">
          <a href="#fonctionnalites" className="interactive-lift hover:text-[#C9A84C] transition-colors">
            FONCTIONNALITÉS
          </a>
          <a href="#manifeste" className="interactive-lift hover:text-[#C9A84C] transition-colors">
            PHILOSOPHIE
          </a>
          <a href="#protocole" className="interactive-lift hover:text-[#C9A84C] transition-colors">
            PROTOCOLE
          </a>
          <a href="#tarifs" className="interactive-lift hover:text-[#C9A84C] transition-colors">
            ADHÉSION
          </a>
          <a href="#securite-donnees" className="interactive-lift hover:text-[#C9A84C] text-emerald-400/90 font-semibold transition-colors flex items-center gap-1">
            <Lock className="w-3 h-3 text-[#C9A84C]" />
            <span>SÉCURITÉ</span>
          </a>
        </div>

        {/* Action Navbar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/app"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white font-mono-data px-3 py-1.5 rounded-full border border-white/10 hover:border-[#C9A84C]/40 transition-colors"
          >
            <Activity className="w-3 h-3 text-[#C9A84C]" />
            <span>ESPACE AGENCE</span>
          </Link>

          <Link
            to="/app/parametres"
            title="Paramètres & Configuration ERP"
            className="w-8 h-8 rounded-full border border-white/10 hover:border-[#C9A84C]/50 flex items-center justify-center text-slate-300 hover:text-[#C9A84C] bg-white/5 transition-all interactive-lift"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-magnetic bg-[#C9A84C] hover:bg-[#E3C878] text-[#0D0D12] px-4 sm:px-6 py-2 sm:py-2.5 text-xs tracking-wider uppercase font-bold shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
          >
            <span className="btn-magnetic-layer"></span>
            <span className="btn-magnetic-content">
              <span>COMMENCER L'ESSAI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </nav>

      {/* ================= COMPOSANT B. SECTION HERO — "LE PLAN D'OUVERTURE" ================= */}
      <section 
        ref={heroRef}
        className="min-h-[100dvh] h-[100dvh] relative flex flex-col justify-end overflow-hidden"
      >
        {/* Image de fond plein cadre Unsplash : Aéronef moderne au-dessus des nuages, symbole de voyage et d'élévation */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=85&w=2560&auto=format&fit=crop')`,
            backgroundPosition: 'center 40%'
          }}
        />

        {/* Overlay progressif multicouche pour contraste parfait et lisibilité absolue du texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-[#0D0D12]/85 to-[#0D0D12]/40 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D12]/90 via-[#0D0D12]/60 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0D0D12_90%)] pointer-events-none z-10" />

        {/* Contenu poussé vers le tiers inférieur gauche */}
        <div className="relative z-20 pb-12 sm:pb-20 pt-32 px-6 sm:px-12 lg:px-20 max-w-5xl flex flex-col items-start">
          
          {/* Badge haute précision */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-[#C9A84C]/30 text-xs font-mono-data text-[#E3C878] mb-6">
            <span className="w-2 h-2 rounded-full bg-[#C9A84C] animate-pulse"></span>
            <span>SYSTEM DIRECTIVES • GDS & VISA MATRIX v4.2</span>
          </div>

          {/* Pattern Titre Hero Preset B : [Nom aspirationnel] rencontre (Sans Gras) / [Mot précision] (Serif Italique Massif) */}
          <div ref={heroTitleRef} className="flex flex-col items-start">
            <span className="font-sans font-bold text-3xl sm:text-5xl lg:text-6xl text-[#FAF8F5] tracking-tight leading-tight">
              L'aviation d'affaires rencontre
            </span>
            <span className="font-drama italic font-normal text-6xl sm:text-8xl lg:text-[7.8rem] leading-[0.9] text-[#C9A84C] tracking-tight mt-1 mb-6 drop-shadow-2xl">
              L'Absolue Précision.
            </span>
          </div>

          {/* Description dérivée de l'objectif de la marque */}
          <p 
            ref={heroSubtitleRef}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8 font-light"
          >
            TukkiPro unifie la synchronisation de vos dossiers de vol, le contrôle consulaire des visas et l'orchestration financière multi-devises. Conçu pour les agences de voyages d'Afrique qui refusent l'approximation.
          </p>

          {/* Boutons CTA avec feeling magnétique */}
          <div ref={heroCtaRef} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-magnetic w-full sm:w-auto bg-[#C9A84C] hover:bg-[#E3C878] text-[#0D0D12] px-8 py-4 text-sm tracking-wider uppercase font-bold shadow-[0_8px_30px_rgba(201,168,76,0.35)]"
            >
              <span className="btn-magnetic-layer"></span>
              <span className="btn-magnetic-content">
                <span>COMMENCER L'ESSAI GRATUIT</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>

            <Link
              to="/app"
              className="btn-magnetic w-full sm:w-auto bg-white/5 hover:bg-white/10 text-[#FAF8F5] border border-white/15 px-7 py-4 text-sm tracking-wider uppercase font-medium backdrop-blur-md"
            >
              <span className="btn-magnetic-layer bg-white/10"></span>
              <span className="btn-magnetic-content">
                <Activity className="w-4 h-4 text-[#C9A84C]" />
                <span>ACCÉDER À L'ESPACE AGENCE</span>
              </span>
            </Link>
          </div>

          {/* Barre télémétrique inférieure */}
          <div className="mt-10 pt-6 border-t border-white/10 w-full flex flex-wrap items-center justify-between gap-4 text-xs font-mono-data text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>LATENCE SYSTÈME : 14MS</span>
            </div>
            <div className="flex items-center gap-6">
              <span>CONFORMITÉ ICAO 9303</span>
              <span>SYNCHRONISATION IATA AMADEUS/SABRE</span>
              <span>CHIFFREMENT BANCAIRE AES-256</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPOSANT C. FONCTIONNALITÉS — "ARTEFACTS FONCTIONNELS INTERACTIFS" ================= */}
      <section id="fonctionnalites" className="py-28 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono-data text-[#C9A84C] uppercase tracking-widest mb-3">
              <span>[ 01 / ARTEFACTS OPÉRATIONNELS ]</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-[#FAF8F5]">
              Trois instruments conçus pour la virtuosité.
            </h2>
          </div>
          <p className="text-sm sm:text-base text-slate-400 max-w-md font-light leading-relaxed">
            Chaque module n'est pas une simple fiche marketing, mais un reflet direct de la télémétrie de vol, du contrôle consulaire et des encaissements de TukkiPro.
          </p>
        </div>

        {/* Grille des 3 Cartes Interactives */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CARTE 1 — "MÉLANGEUR DIAGNOSTIQUE" (Argument 1 : Centralisation & synchronisation temps réel des vols & groupes) */}
          <div 
            className="luxury-card p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden group"
            onMouseEnter={() => setIsMixerPaused(true)}
            onMouseLeave={() => setIsMixerPaused(false)}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                  <Plane className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 font-mono-data text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  <RefreshCw className={`w-3 h-3 ${isMixerPaused ? '' : 'animate-spin'}`} style={{ animationDuration: '6s' }} />
                  <span>{isMixerPaused ? 'PAUSE' : 'CYCLE AUTO 3S'}</span>
                </div>
              </div>

              <h3 className="font-sans font-bold text-xl text-[#FAF8F5] mb-2 tracking-tight">
                Mélangeur Diagnostique Aérien
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                Centralisation et synchronisation temps réel des manifestes de vol, quotas d'hôtels et passagers pèlerinage ou affrètement VIP.
              </p>

              {/* Les 3 cartes superposées qui cyclent verticalement */}
              <div className="relative h-[210px] w-full pt-2">
                {mixerCards.map((item, idx) => {
                  // Positionnement en profondeur élastique
                  const offset = idx * 16;
                  const scale = 1 - idx * 0.05;
                  const zIndex = 30 - idx * 10;
                  const opacity = 1 - idx * 0.22;

                  return (
                    <div
                      key={item.id}
                      className="absolute inset-x-0 top-0 p-4 rounded-2xl bg-[#181824] border border-[#C9A84C]/25 shadow-xl transition-all duration-700"
                      style={{
                        transform: `translateY(${offset}px) scale(${scale})`,
                        zIndex,
                        opacity,
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono-data text-[11px] font-bold text-[#E3C878]">
                          {item.ref}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${item.statusBadge}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="font-sans font-semibold text-xs text-[#FAF8F5] line-clamp-1 mb-1">
                        {item.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/5 font-mono-data">
                        <span>{item.meta}</span>
                        <span className="text-[#FAF8F5] font-semibold">{item.amount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-data text-[11px] text-[#C9A84C]">PNR AMADEUS ACTIF</span>
              <span className="text-[11px]">3 manifestes en rotation</span>
            </div>
          </div>

          {/* CARTE 2 — "MACHINE À ÉCRIRE TÉLÉMÉTRIE" (Argument 2 : Hub passeports, visas & alertes d'expiration) */}
          <div className="luxury-card p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                {/* Point pulsant et label Flux en Direct */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 font-mono-data text-[10px] text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>FLUX EN DIRECT</span>
                </div>
              </div>

              <h3 className="font-sans font-bold text-xl text-[#FAF8F5] mb-2 tracking-tight">
                Machine à Écrire Télémétrie
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                Flux consulaire haute-fidélité. Vérification instantanée des passeports ICAO, dépôt des visas Schengen et alertes d'expiration automatiques.
              </p>

              {/* Console télémétrique en direct */}
              <div className="rounded-2xl bg-[#09090D] border border-white/10 p-4 font-mono-data text-xs min-h-[190px] flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 mb-3 border-b border-white/5">
                    <span>TERMINAL VFS/ICAO GATEWAY</span>
                    <span className="text-emerald-400">200 OK</span>
                  </div>
                  <div className="text-slate-300 text-[11px] leading-relaxed break-words font-mono-data">
                    {typedText}
                    <span className="inline-block w-2 h-3.5 bg-[#C9A84C] ml-1 align-middle animate-cursor"></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>LOGS {logIndex + 1}/{telemetryLogs.length}</span>
                  <span className="text-[#C9A84C]">CHIFFRÉ SHA-256</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-data text-[11px] text-[#C9A84C]">ICAO 9303 CERTIFIED</span>
              <span className="text-[11px]">Audit consulaire passif</span>
            </div>
          </div>

          {/* CARTE 3 — "PLANIFICATEUR PROTOCOLE CURSEUR" (Argument 3 : Facturation automatisée, acomptes & devises) */}
          <div className="luxury-card p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="font-mono-data text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  SIMULATION DE CURSEUR
                </div>
              </div>

              <h3 className="font-sans font-bold text-xl text-[#FAF8F5] mb-2 tracking-tight">
                Planificateur Protocole Curseur
              </h3>
              <p className="text-xs text-slate-400 mb-6 font-light leading-relaxed">
                Ordonnanceur de trésorerie. Programmation des échéances d'acomptes, rappels automatiques et clôture des soldes multi-devises.
              </p>

              {/* Grille Hebdomadaire avec Curseur Animé */}
              <div className="rounded-2xl bg-[#161622] border border-white/10 p-4 relative min-h-[190px] flex flex-col justify-between overflow-hidden shadow-inner">
                
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-data text-slate-400 mb-3">
                    <span>ÉCHÉANCIER ENCAISSEMENTS</span>
                    <span className="text-[#C9A84C] font-semibold">18 450 000 XOF</span>
                  </div>

                  {/* Grille des 7 jours */}
                  <div className="grid grid-cols-7 gap-1.5 mb-4">
                    {daysOfWeek.map((d, index) => {
                      const isTarget = index === 4; // Vendredi
                      const isHighlighted = isTarget && cursorPhase >= 1;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col items-center justify-center py-2.5 rounded-xl border text-[11px] font-mono-data transition-all duration-300 ${
                            isHighlighted
                              ? 'bg-[#C9A84C] text-[#0D0D12] border-[#E3C878] font-bold shadow-md shadow-[#C9A84C]/30 scale-105'
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}
                        >
                          <span className="text-[9px] opacity-75">{d.short}</span>
                          <span className="font-bold">{20 + index}</span>
                          {isHighlighted && <Check className="w-2.5 h-2.5 mt-0.5" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bouton Sauvegarder récepteur du curseur */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[10px] font-mono-data text-slate-400">
                    Acompte J-4 (80%)
                  </span>
                  <div 
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono-data font-bold transition-all duration-300 ${
                      cursorPhase === 2 || cursorPhase === 3
                        ? 'bg-[#C9A84C] text-[#0D0D12] scale-95 shadow-md shadow-[#C9A84C]/40'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {cursorPhase === 3 ? '✓ ENREGISTRÉ' : 'SAUVEGARDER'}
                  </div>
                </div>

                {/* Curseur SVG Virtuel en mouvement */}
                <div 
                  className="absolute pointer-events-none transition-all duration-700 ease-out z-30"
                  style={{
                    top: cursorPhase === 0 ? '70%' : cursorPhase === 1 ? '38%' : '75%',
                    left: cursorPhase === 0 ? '15%' : cursorPhase === 1 ? '68%' : '78%',
                    transform: cursorPhase === 1 ? 'scale(0.9)' : 'scale(1)',
                    opacity: cursorPhase === 3 ? 0 : 1
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                    <path 
                      d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z" 
                      fill="#C9A84C" 
                      stroke="#0D0D12" 
                      strokeWidth="1.5" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono-data text-[11px] text-[#C9A84C]">MULTI-DEVISES XOF/EUR</span>
              <span className="text-[11px]">Rapprochement automatique</span>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPOSANT D. PHILOSOPHIE — "LE MANIFESTE" ================= */}
      <section 
        id="manifeste" 
        ref={manifestoRef}
        className="relative py-36 px-6 sm:px-12 lg:px-20 bg-[#07070A] border-y border-white/10 overflow-hidden"
      >
        {/* Texture marbre sombre luxe parallaxe à faible opacité */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2400&auto=format&fit=crop')`
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          
          <div className="reveal-text inline-flex items-center gap-2 text-xs font-mono-data text-[#C9A84C] uppercase tracking-widest mb-8">
            <span>[ LE MANIFESTE DE PRÉCISION ]</span>
          </div>

          {/* Pattern : La plupart des [industrie] se concentrent sur : [approche commune]. (Neutre, plus petit) */}
          <p className="reveal-text text-lg sm:text-2xl text-slate-400 font-sans tracking-tight leading-relaxed max-w-3xl">
            La plupart des logiciels de voyage se concentrent sur : l'accumulation de formulaires denses, de tableurs disparates et la gestion réactive dans l'urgence des départs.
          </p>

          {/* Pattern : Nous nous concentrons sur : [approche différenciée]. (Massif, Serif Italique Dramatique, accent champagne) */}
          <div className="reveal-text mt-8 pt-8 border-t border-white/10">
            <h3 className="font-drama italic font-normal text-4xl sm:text-6xl lg:text-7xl text-[#FAF8F5] leading-[1.1] tracking-tight">
              Nous nous concentrons sur : <br className="hidden sm:block" />
              <span className="text-[#C9A84C] not-italic font-sans font-extrabold tracking-tight">
                la virtuosité opérationnelle
              </span>{' '}
              et l'exactitude millimétrée de chaque voyageur.
            </h3>
          </div>

          {/* Piliers métriques de confiance */}
          <div className="reveal-text grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-12 border-t border-white/10 text-left font-mono-data">
            <div>
              <div className="text-3xl font-bold text-[#E3C878] mb-1">0.02s</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Latence d'Accès aux PNR</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#E3C878] mb-1">100%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Conformité Consulaire ICAO</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#E3C878] mb-1">Zero</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">Alerte d'Acompte Échappée</div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPOSANT E. PROTOCOLE — "ARCHIVE EMPILÉE STICKY" ================= */}
      <section id="protocole" ref={stackRef} className="py-24 px-6 sm:px-12 lg:px-20 max-w-6xl mx-auto">
        
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono-data text-[#C9A84C] uppercase tracking-widest mb-3">
            <span>[ 02 / PROTOCOLE D'EXÉCUTION ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-[#FAF8F5]">
            L'Archive Empilée : Trois Niveaux de Rigueur.
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mt-3 font-light">
            Chaque phase verrouille l'intégrité du voyage de vos clients sans friction humaine.
          </p>
        </div>

        <div className="space-y-12">

          {/* CARTE 01 — Gyroscope géométrique en rotation lente */}
          <div className="protocol-stack-card luxury-container p-8 sm:p-12 min-h-[460px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="flex-1 max-w-xl">
              <div className="font-mono-data text-xs text-[#C9A84C] mb-2 tracking-widest">
                01 / ORCHESTRATION DU VOL & GROUPES
              </div>
              <h3 className="font-sans font-bold text-2xl sm:text-4xl text-[#FAF8F5] mb-4 tracking-tight">
                Capture Instantanée & Synchronisation PNR
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                Ingestion automatique des réservations Amadeus, Sabre et vols directs. Centralisation des contingents et répartition des passagers en 3 clics, avec génération instantanée des bons de commande.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono-data text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>AMADEUS DIRECT API • LATENCE 18MS</span>
              </div>
            </div>

            {/* Animation SVG Géométrique Gyroscopique */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 relative flex items-center justify-center">
              <svg className="w-full h-full animate-gyro" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#C9A84C" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
                <circle cx="100" cy="100" r="65" fill="none" stroke="#E3C878" strokeWidth="1.5" opacity="0.6" />
                <circle cx="100" cy="100" r="45" fill="none" stroke="#FAF8F5" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="#C9A84C" strokeWidth="1" opacity="0.3" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="#C9A84C" strokeWidth="1" opacity="0.3" />
              </svg>
              <svg className="w-40 h-40 absolute animate-gyro-reverse" viewBox="0 0 200 200">
                <rect x="35" y="35" width="130" height="130" fill="none" stroke="#C9A84C" strokeWidth="1.2" opacity="0.4" rx="20" />
                <circle cx="100" cy="100" r="25" fill="none" stroke="#C9A84C" strokeWidth="2" />
                <circle cx="100" cy="100" r="5" fill="#C9A84C" />
              </svg>
            </div>
          </div>

          {/* CARTE 02 — Laser horizontal de balayage sur matrice de points */}
          <div className="protocol-stack-card luxury-container p-8 sm:p-12 min-h-[460px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="flex-1 max-w-xl">
              <div className="font-mono-data text-xs text-[#C9A84C] mb-2 tracking-widest">
                02 / SÉCURISATION CONSULAIRE & BIOMÉTRIE
              </div>
              <h3 className="font-sans font-bold text-2xl sm:text-4xl text-[#FAF8F5] mb-4 tracking-tight">
                Audit Consulaire & Traçabilité Biométrique
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                Vérification automatisée de la conformité des passeports ICAO 9303 et suivi temps réel auprès des consulats. Détection préventive des dates limites et relances biométriques par WhatsApp officiel.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono-data text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>ICAO 9303 COMPLIANT • CHIFFREMENT AES-256</span>
              </div>
            </div>

            {/* Animation Matrice Laser */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 relative rounded-2xl bg-[#09090D] border border-[#C9A84C]/25 p-4 overflow-hidden flex flex-col justify-between">
              {/* Grille de points */}
              <div className="grid grid-cols-6 grid-rows-6 gap-3 w-full h-full p-2">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 mx-auto my-auto"></div>
                ))}
              </div>
              {/* Ligne Laser qui balaye */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent shadow-[0_0_12px_#C9A84C] animate-laser"></div>
              <div className="absolute bottom-2 right-2 text-[9px] font-mono-data text-[#C9A84C] bg-black/60 px-2 py-0.5 rounded">
                SCANNING BIOMETRICS
              </div>
            </div>
          </div>

          {/* CARTE 03 — Forme d'onde ECG pulsante */}
          <div className="protocol-stack-card luxury-container p-8 sm:p-12 min-h-[460px] flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl">
            <div className="flex-1 max-w-xl">
              <div className="font-mono-data text-xs text-[#C9A84C] mb-2 tracking-widest">
                03 / TRÉSORERIE & RÈGLEMENTS MULTI-DEVISES
              </div>
              <h3 className="font-sans font-bold text-2xl sm:text-4xl text-[#FAF8F5] mb-4 tracking-tight">
                Encaissement Fractionné & Rapprochement Bancaire
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-light mb-6">
                Gestion unifiée des règlements en FCFA (XOF), EUR et USD. Déclenchement automatique des alertes d'acomptes, génération des factures normalisées et suivi de marge brute par dossier.
              </p>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono-data text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>RAPPROCHEMENT AUTOMATISÉ BCEAO / SWIFT</span>
              </div>
            </div>

            {/* Animation SVG Waveform ECG */}
            <div className="w-56 h-56 sm:w-64 sm:h-64 relative rounded-2xl bg-[#09090D] border border-[#C9A84C]/25 p-4 flex flex-col justify-center items-center">
              <svg className="w-full h-28" viewBox="0 0 300 100">
                <path
                  d="M 0 50 L 50 50 L 70 20 L 90 80 L 110 40 L 130 60 L 150 50 L 200 50 L 220 10 L 240 90 L 260 50 L 300 50"
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-waveform"
                />
              </svg>
              <div className="flex items-center justify-between w-full text-[10px] font-mono-data text-slate-400 px-2 mt-2">
                <span>TREASURY OSCILLATOR</span>
                <span className="text-emerald-400">STABLE • +18.4M XOF</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= COMPOSANT F. ADHÉSION / TARIFICATION ================= */}
      <section id="tarifs" className="py-28 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono-data text-[#C9A84C] uppercase tracking-widest mb-3">
            <span>[ 03 / TARIFICATION & ADHÉSION ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-sans font-extrabold tracking-tight text-[#FAF8F5] mb-4">
            Un investissement calibré pour votre réputation.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base font-light">
            Déployez l'instrument dans votre agence en quelques minutes. Sans engagement de durée, résiliable en un clic.
          </p>

          {/* Toggle Devises FCFA / EUR */}
          <div className="inline-flex items-center p-1 rounded-full bg-white/5 border border-white/10 mt-8 font-mono-data text-xs">
            <button
              onClick={() => setCurrency('XOF')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                currency === 'XOF' ? 'bg-[#C9A84C] text-[#0D0D12] font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              FCFA (XOF)
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                currency === 'EUR' ? 'bg-[#C9A84C] text-[#0D0D12] font-bold shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              EUROS (€)
            </button>
          </div>
        </div>

        {/* Grille des 3 Niveaux */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* NIVEAU 1 : ESSENTIEL / ÉMERGENCE */}
          <div className="luxury-card p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono-data text-xs text-slate-400 mb-2">AGENCES ÉMERGENTES</div>
              <h3 className="font-sans font-bold text-2xl text-[#FAF8F5] mb-2">Émergence</h3>
              <p className="text-xs text-slate-400 font-light mb-6">
                Pour les agences indépendantes et conciergeries privées en plein essor.
              </p>

              <div className="mb-8">
                <span className="font-sans font-extrabold text-4xl text-[#FAF8F5]">
                  {currency === 'XOF' ? '65 000' : '99'}
                </span>
                <span className="text-xs font-mono-data text-slate-400 ml-2">
                  {currency === 'XOF' ? 'FCFA / mois' : '€ / mois'}
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300 mb-8 font-light">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Jusqu'à 300 dossiers actifs / mois</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Hub Visas & vérification OCR passeports</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>2 accès collaborateurs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Suivi des acomptes & facturation PDF</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-magnetic w-full py-3.5 px-6 rounded-full border border-white/20 hover:border-[#C9A84C] text-[#FAF8F5] text-xs font-bold tracking-wider uppercase transition-colors"
            >
              <span className="btn-magnetic-layer bg-white/10"></span>
              <span className="btn-magnetic-content">
                <span>COMMENCER L'ESSAI</span>
              </span>
            </button>
          </div>

          {/* NIVEAU 2 : PERFORMANCE / SIGNATURE (CARTE DU MILIEU QUI RESSORT) */}
          <div className="luxury-container p-8 sm:p-10 flex flex-col justify-between relative ring-2 ring-[#C9A84C] shadow-[0_0_50px_rgba(201,168,76,0.25)] lg:-translate-y-3 bg-[#111118]">
            {/* Badge Prestigieux */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#C9A84C] text-[#0D0D12] text-[10px] font-mono-data font-extrabold tracking-widest uppercase shadow-md">
              LE CHOIX DES LEADERS
            </div>

            <div>
              <div className="font-mono-data text-xs text-[#E3C878] mb-2">AGENCES LEADERS & TOURS OPÉRATEURS</div>
              <h3 className="font-sans font-bold text-3xl text-[#FAF8F5] mb-2">Signature</h3>
              <p className="text-xs text-slate-300 font-light mb-6">
                Le standard de l'industrie pour les agences à fort volume et vols de groupe.
              </p>

              <div className="mb-8">
                <span className="font-sans font-extrabold text-5xl text-[#FAF8F5]">
                  {currency === 'XOF' ? '185 000' : '280'}
                </span>
                <span className="text-xs font-mono-data text-[#E3C878] ml-2">
                  {currency === 'XOF' ? 'FCFA / mois' : '€ / mois'}
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-200 mb-8">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span className="font-semibold">Dossiers et passagers illimités</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Synchronisation GDS Amadeus & Sabre temps réel</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Relances automatiques WhatsApp client</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Jusqu'à 10 collaborateurs avec rôles</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Support VIP WhatsApp dédié 7j/7</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-magnetic w-full py-4 px-6 rounded-full bg-[#C9A84C] hover:bg-[#E3C878] text-[#0D0D12] text-xs font-extrabold tracking-wider uppercase shadow-[0_6px_25px_rgba(201,168,76,0.4)]"
            >
              <span className="btn-magnetic-layer"></span>
              <span className="btn-magnetic-content">
                <span>COMMENCER L'ESSAI 14 JOURS</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          </div>

          {/* NIVEAU 3 : ENTREPRISE / CONSORTIUM */}
          <div className="luxury-card p-8 flex flex-col justify-between">
            <div>
              <div className="font-mono-data text-xs text-slate-400 mb-2">RÉSEAUX & COMPAGNIES D'AFFRÈTEMENT</div>
              <h3 className="font-sans font-bold text-2xl text-[#FAF8F5] mb-2">Consortium</h3>
              <p className="text-xs text-slate-400 font-light mb-6">
                Pour les réseaux multi-filiales et opérateurs nationaux exigeant du sur-mesure.
              </p>

              <div className="mb-8">
                <span className="font-sans font-extrabold text-4xl text-[#FAF8F5]">
                  Sur Devis
                </span>
                <span className="text-xs font-mono-data text-slate-400 ml-2">
                  Accord Annuel
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-slate-300 mb-8 font-light">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Déploiement multi-agences et filiales</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>API personnalisée & intégration ERP comptable</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>Collaborateurs illimités</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />
                  <span>SLA 99.98% garanti avec ingénieur dédié</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-magnetic w-full py-3.5 px-6 rounded-full border border-white/20 hover:border-[#C9A84C] text-[#FAF8F5] text-xs font-bold tracking-wider uppercase transition-colors"
            >
              <span className="btn-magnetic-layer bg-white/10"></span>
              <span className="btn-magnetic-content">
                <span>CONTACTER LA DIRECTION</span>
              </span>
            </button>
          </div>

        </div>
      </section>

      {/* ================= SECTION SÉCURITÉ & PROTECTION STRICTE DES DONNÉES ================= */}
      <section id="securite-donnees" className="py-20 px-6 sm:px-12 lg:px-20 max-w-7xl mx-auto">
        
        {/* Conteneur global avec fond vert fondu riche et halos lumineux */}
        <div className="rounded-[3.2rem] bg-gradient-to-br from-[#06382c] via-[#0a4e3d] to-[#04241c] text-white p-6 sm:p-10 lg:p-14 border border-emerald-400/30 shadow-[0_25px_60px_rgba(6,56,44,0.35)] relative overflow-hidden">
          
          {/* Halos lumineux ambiants vert émeraude */}
          <div className="absolute -top-28 -right-28 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* En-tête concise et ultra-lisible */}
          <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-3 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ARCHITECTURE SÉCURISÉE & CONFIDENTIELLE</span>
            </div>
            <h2 className="font-sans font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Sécurité & Confidentialité Intransigeantes
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base mt-2.5 font-normal leading-relaxed">
              Vos fiches passagers, visas consulaires et données d'agence sont protégés par des règles strictes gravées au cœur de notre base de données.
            </p>
          </div>

          {/* DISPOSITION NOUVELLE : Case Maîtresse Pleine Largeur + 4 Colonnes Spécialisées */}
          <div className="space-y-5 relative z-10">
            
            {/* CASE MAÎTRESSE 1 : Cloisonnement absolu des comptes (Interactive avec animation) */}
            <div className="group rounded-[2.2rem] bg-[#072d24]/90 hover:bg-[#09362b] border border-emerald-400/30 hover:border-emerald-400 p-6 sm:p-8 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_35px_rgba(16,185,129,0.25)] relative overflow-hidden">
              {/* Reflet lumineux au survol */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Côté gauche : Titre & Explication claire */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-300 uppercase block">Pilier Fondamental</span>
                      <h3 className="text-xl sm:text-2xl font-bold font-title text-white tracking-tight">
                        Cloisonnement absolu des comptes
                      </h3>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-100 leading-relaxed font-normal">
                    Techniquement, il est <strong className="text-white font-semibold">impossible pour un autre utilisateur ou une agence concurrente</strong> d'accéder à vos dossiers. Chaque espace est isolé et verrouillé au niveau du moteur de données, et non par un simple filtre d'affichage.
                  </p>
                </div>

                {/* Côté droit : 3 Puces de garantie interactives */}
                <div className="lg:col-span-5 flex flex-col gap-2.5">
                  <div className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-400/25 hover:border-emerald-400/50 flex items-center gap-3 text-xs sm:text-sm text-white transition-all duration-200 hover:translate-x-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">✓</span>
                    <span className="font-medium text-emerald-50">Vos données ne sont jamais mutualisées</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-400/25 hover:border-emerald-400/50 flex items-center gap-3 text-xs sm:text-sm text-white transition-all duration-200 hover:translate-x-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">✓</span>
                    <span className="font-medium text-emerald-50">Aucun accès administratif non autorisé</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-400/25 hover:border-emerald-400/50 flex items-center gap-3 text-xs sm:text-sm text-white transition-all duration-200 hover:translate-x-1">
                    <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">✓</span>
                    <span className="font-medium text-emerald-50">Suppression définitive sur simple demande</span>
                  </div>
                </div>

              </div>
            </div>

            {/* GRILLE DES 4 CASES SPÉCIALISÉES (Disposition 4 colonnes, chacune animée) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Case 1 : Invisibilité totale */}
              <div className="group rounded-[1.8rem] bg-[#072d24]/90 hover:bg-[#09362b] border border-emerald-400/30 hover:border-emerald-400 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/25 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-title text-white mb-2">Invisibilité totale</h4>
                  <p className="text-xs sm:text-[13px] text-emerald-100 font-normal leading-relaxed">
                    Aucun autre utilisateur ne peut détecter, consulter ou soupçonner l'existence de vos dossiers. Votre espace est étanche et invisible au reste du monde.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Isolation réseau stricte</span>
                </div>
              </div>

              {/* Case 2 : Authentification stricte */}
              <div className="group rounded-[1.8rem] bg-[#072d24]/90 hover:bg-[#09362b] border border-emerald-400/30 hover:border-emerald-400 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/25 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Key className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-title text-white mb-2">Authentification stricte</h4>
                  <p className="text-xs sm:text-[13px] text-emerald-100 font-normal leading-relaxed">
                    Accès protégé par des protocoles chiffrés et des sessions temporisées. Sans identifiants vérifiés, toute tentative d'intrusion est bloquée net.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center gap-2 text-[11px] text-amber-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Sessions infalsifiables</span>
                </div>
              </div>

              {/* Case 3 : Données chiffrées */}
              <div className="group rounded-[1.8rem] bg-[#072d24]/90 hover:bg-[#09362b] border border-emerald-400/30 hover:border-emerald-400 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-teal-400/25 border border-teal-400/40 text-teal-200 flex items-center justify-center font-bold mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <Database className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-title text-white mb-2">Données chiffrées</h4>
                  <p className="text-xs sm:text-[13px] text-emerald-100 font-normal leading-relaxed">
                    Toutes vos pièces sensibles (passeports, reçus, visas) transitent et dorment sous chiffrement AES-256. Aucune information ne circule en clair.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center gap-2 text-[11px] text-teal-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-300"></span>
                  <span>Chiffrement AES-256</span>
                </div>
              </div>

              {/* Case 4 : Zéro partage, zéro revente */}
              <div className="group rounded-[1.8rem] bg-[#072d24]/90 hover:bg-[#09362b] border border-emerald-400/30 hover:border-emerald-400 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] flex flex-col justify-between relative overflow-hidden">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-400/25 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-title text-white mb-2">Zéro partage, zéro revente</h4>
                  <p className="text-xs sm:text-[13px] text-emerald-100 font-normal leading-relaxed">
                    Vos bases clients ne font l'objet d'aucun profilage commercial ni partage tiers. Ce que vous renseignez appartient exclusivement à votre agence.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-emerald-800/40 flex items-center gap-2 text-[11px] text-emerald-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Propriété 100% agence</span>
                </div>
              </div>

            </div>

            {/* BANDEAU INFÉRIEUR : Engagement ferme + Badge vert (animé au survol) */}
            <div className="group p-5 sm:p-6 rounded-[2rem] bg-[#05261e]/90 hover:bg-[#073026] border border-emerald-400/40 hover:border-emerald-400 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-emerald-100 leading-relaxed text-xs sm:text-[13px]">
                  <strong className="text-white font-bold">Engagement ferme :</strong> seul le titulaire du compte peut lire, modifier ou supprimer ses données. Cette règle est gravée dans notre architecture système — elle ne souffre d'aucune exception.
                </div>
              </div>
              <div className="shrink-0 flex items-center self-start sm:self-auto">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/90 border border-emerald-400/60 text-emerald-300 font-bold text-xs shadow-inner group-hover:bg-emerald-800/90 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Confidentiel & Sécurisé</span>
                </span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ================= COMPOSANT G. PIED DE PAGE ================= */}
      <footer className="bg-[#07070A] rounded-t-[4rem] border-t border-[#C9A84C]/25 pt-20 pb-12 px-6 sm:px-12 lg:px-20 mt-16">
        <div className="max-w-7xl mx-auto">
          
          {/* Indicateur de statut "Système Opérationnel" OBLIGATOIRE */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-12 mb-12 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="font-mono-data text-xs text-emerald-400 tracking-wider font-semibold">
                SYSTÈME OPÉRATIONNEL — TOUTES PASSERELLES IATA / GDS ACTIVES (14MS)
              </span>
            </div>

            <div className="font-mono-data text-xs text-slate-400">
              HEURE UTC : {new Date().toISOString().slice(11, 19)}
            </div>
          </div>

          {/* Grille du Footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-white/10 text-xs">
            
            {/* Colonne 1 : Identité */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0D0D12] font-drama font-bold text-xs">
                  T
                </div>
                <span className="font-sans font-extrabold tracking-widest text-[#FAF8F5] text-sm">
                  TUKKI<span className="text-[#C9A84C]">PRO</span>
                </span>
              </div>
              <p className="text-slate-400 font-light leading-relaxed">
                L'instrument digital d'orchestration conçu pour les agences de voyages d'Afrique. Zéro approximation, maîtrise totale.
              </p>
            </div>

            {/* Colonne 2 : Plateforme */}
            <div className="space-y-3">
              <span className="font-mono-data text-[11px] text-[#C9A84C] uppercase tracking-wider block">
                PLATEFORME
              </span>
              <ul className="space-y-2 text-slate-400 font-light">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Mélangeur Diagnostique</a></li>
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Machine à Écrire Télémétrie</a></li>
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Planificateur Protocole</a></li>
                <li><Link to="/app" className="hover:text-white transition-colors">Espace Agence en Direct</Link></li>
              </ul>
            </div>

            {/* Colonne 3 : Hubs Régionaux */}
            <div className="space-y-3">
              <span className="font-mono-data text-[11px] text-[#C9A84C] uppercase tracking-wider block">
                HUBS OPÉRATIONNELS
              </span>
              <ul className="space-y-2 text-slate-400 font-light">
                <li>Dakar • Sénégal (Siège Opérationnel)</li>
                <li>Abidjan • Côte d'Ivoire</li>
                <li>Bamako • Mali</li>
                <li>Paris • Liaison Consulaire</li>
              </ul>
            </div>

            {/* Colonne 4 : Conformité */}
            <div className="space-y-3">
              <span className="font-mono-data text-[11px] text-[#C9A84C] uppercase tracking-wider block">
                STANDARDS
              </span>
              <ul className="space-y-2 text-slate-400 font-light">
                <li>Norme OACI 9303 (Passeports)</li>
                <li>Protocole IATA NDC Level 4</li>
                <li>Chiffrement Bancaire AES-256</li>
                <li>Conformité RGPD & Données Souveraines</li>
              </ul>
            </div>

          </div>

          {/* Bas de page Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono-data gap-4">
            <div>
              © 2026 TUKKIPRO INSTRUMENT. TOUS DROITS RÉSERVÉS.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#C9A84C] transition-colors">CONFIDENTIALITÉ</a>
              <a href="#" className="hover:text-[#C9A84C] transition-colors">CONDITIONS D'ENGAGEMENT</a>
              <a href="#" className="hover:text-[#C9A84C] transition-colors">CERTIFICAT SOUVERAIN</a>
            </div>
          </div>

        </div>
      </footer>

      {/* ================= MODAL DE COMMANDE / ESSAI GRATUIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="luxury-container max-w-lg w-full p-8 relative shadow-2xl border border-[#C9A84C]/40 bg-[#12121A]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-sm font-mono-data"
            >
              [ FERMER ]
            </button>

            {modalSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C] text-[#C9A84C] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#FAF8F5] mb-2">
                  Instrument Réservé
                </h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Votre instance TukkiPro est en cours d'initialisation pour <strong>{agencyName || 'votre agence'}</strong>. Vos accès sécurisés vous sont transmis par WhatsApp.
                </p>
              </div>
            ) : (
              <div>
                <div className="font-mono-data text-xs text-[#C9A84C] mb-1">
                  INITIALISATION INSTANTANÉE
                </div>
                <h3 className="font-sans font-bold text-2xl text-[#FAF8F5] mb-2">
                  Démarrer l'essai gratuit
                </h3>
                <p className="text-xs text-slate-400 font-light mb-6">
                  Accédez immédiatement à l'environnement complet de gestion de dossiers et visas. 14 jours offerts, sans carte bancaire.
                </p>

                <form onSubmit={handleModalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono-data text-slate-300 mb-1">
                      NOM DE VOTRE AGENCE *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sahel Voyages Prestige"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-data text-slate-300 mb-1">
                      NUMÉRO WHATSAPP PROFESSIONNEL *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+221 77 000 00 00"
                      value={agencyPhone}
                      onChange={(e) => setAgencyPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-data text-slate-300 mb-1">
                      EMAIL DE L'AGENCE *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="direction@agence-voyages.sn"
                      value={agencyEmail}
                      onChange={(e) => setAgencyEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C9A84C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-magnetic w-full py-3.5 mt-4 rounded-full bg-[#C9A84C] hover:bg-[#E3C878] text-[#0D0D12] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#C9A84C]/30"
                  >
                    <span className="btn-magnetic-layer"></span>
                    <span className="btn-magnetic-content">
                      <span>ACTIVER MON ACCÈS SÉCURISÉ</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>

                  <div className="text-center text-[10px] text-slate-400 pt-2 font-mono-data">
                    ✓ DÉPLOIEMENT EN 60 SECONDES • SUPPORT VIP SÉNÉGAL & CÔTE D'IVOIRE
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from "react";
import { Check, Sparkles, Star, Crown } from "lucide-react";

/**
 * PricingSection
 * - 3 packs (Essentiel, Premium, Master)
 * - Toggle Mensuel / Annuel
 * - Benefits per tier
 * - Highlight "Premium" as Best Value
 *
 * Drop this component into your React app.
 * Requires Tailwind CSS + lucide-react.
 */
export default function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      id: "essentiel",
      title: "Pack Essentiel",
      icon: Sparkles,
      monthly: 750,
      yearlyMonthly: 600, // price per month when billed annually
      yearlyTotal: 7200,
      blurb: "Pour débuter avec les outils clés de suivi et de gestion.",
      features: [
        "Gestion des rendez-vous : jusqu’à 50/mois",
        "Tableau de suivi : mise à jour mensuelle par patient",
        "Calculs IMC / Métabolisme de base / Apport calorique illimités",
        "Programmes nutritionnels : 120 régime/mois",
        "Programmes d’entraînement : 80 Progmme d'entrainement/mois",
        "Régimes générés par l’IA : 30 régime/mois",
        "Support e-mail sous 48h",
      ],
      cta: "Commencer",
      recommended: false,
    },
    {
      id: "premium",
      title: "Pack Premium",
      icon: Pro,
      monthly: 1000,
      yearlyMonthly: 833,
      yearlyTotal: 9996, // selon votre note commerciale, sinon 9600 si -20% strict
      blurb: "Pour plus de patients et un suivi avancé.",
      features: [
        "Rendez-vous : jusqu’à 300/mois",
        "Tableau de suivi : mise à jour hebdomadaire",
        "Calculs illimités IMC + export PDF",
        "Programmes nutritionnels : 1200 régimes/mois",
        "Entraînements :800 programme personnalisés/mois",
        "Régimes générés par l’IA : 525 régimes/mois",
        "Support prioritaire (e-mail + chat) < 24h",
        "Template pérsonnalisés ",
        "Rapports statistiques globaux",
      ],
      cta: "Choisir Premium",
      recommended: true,
      badge: "Meilleur choix",
    },
    {
      id: "pro",
      title: "Pack Master",
      icon: Crown,
      monthly: 1625,
      yearlyMonthly: 1300,
      yearlyTotal: 13000,
      blurb: "Pour cabinets et coachs qui veulent tout, sans limite.",
      features: [
        "Rendez-vous illimités",
        "Tableau de suivi quotidien + historique complet",
        "Calculs illimités + comparatifs",
        "Programmes nutritionnels illimités",
        "Régimes générés par l’IA : illimités",
        "Entraînements illimités et 100% personnalisés",
        "Support premium (téléphone / e-mail / chat) < 12h",
        "Rapports PDF",
      ],
      cta: "Passer en Pro",
      recommended: false,
    },
  ];

  return (
    <section className="w-full px-4 py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Packs & Tarifs — Médecins et Nutritionnistes
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            Toutes les fonctionnalités dans chaque pack, avec des niveaux d’utilisation adaptés à vos besoins, dont les **régimes générés par l’IA**.
          </p>
        </div>

        {/* Toggle billing */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className={`text-sm ${!annual ? "text-slate-900" : "text-slate-500"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className="relative inline-flex h-9 w-16 items-center rounded-full bg-slate-200 transition"
            aria-label="Basculer facturation"
          >
            <span
              className={`inline-block h-7 w-7 transform rounded-full bg-white shadow transition ${
                annual ? "translate-x-8" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm ${annual ? "text-slate-900" : "text-slate-500"}`}>
            Annuel <span className="ml-1 inline-block rounded bg-emerald-100 px-2 py-0.5 text-emerald-700 text-xs">Économies</span>
          </span>
        </div>

        {/* Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} annual={annual} />
          ))}
        </div>

        {/* Footnote */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Prix en MAD. Facturation annuelle = paiement unique du montant annuel indiqué. Les limitations d’usage peuvent être ajustées dans votre panneau d’administration.
        </p>
      </div>
    </section>
  );
}

function PricingCard({ tier, annual }) {
  const Icon = tier.icon;
  const price = annual ? tier.yearlyMonthly : tier.monthly;
  const sub = annual
    ? `${formatMAD(tier.yearlyTotal)} / an`
    : `${formatMAD(tier.monthly)} / mois`;

  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md ${
        tier.recommended ? "border-emerald-500 ring-emerald-200" : ""
      }`}
    >
      {tier.recommended && (
        <div className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
          {tier.badge || "Recommandé"}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          tier.recommended ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-700"
        }`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{tier.title}</h3>
          <p className="text-sm text-slate-600">{tier.blurb}</p>
        </div>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-slate-900">{formatMAD(price)}</span>
        <span className="text-sm text-slate-500">/ mois</span>
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>

      <ul className="mt-6 space-y-2">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
          tier.recommended
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
        onClick={() => alert(`Choisi : ${tier.title} — ${annual ? "Annuel" : "Mensuel"}`)}
      >
        {tier.cta}
      </button>

      {annual && !tier.recommended && (
        <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Bénéficiez d’un tarif annuel réduit : {formatMAD(tier.yearlyMonthly)} / mois
        </p>
      )}
    </div>
  );
}

function formatMAD(n) {
  try {
    return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD" }).format(n);
  } catch {
    return `${n} MAD`;
  }
}

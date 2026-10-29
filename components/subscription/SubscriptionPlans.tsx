"use client";

import { useState } from "react";
import { useAuth, type SubscriptionTier } from "@/lib/auth/auth-context";
import { CelestialGlowCard } from "@/components/ui/CelestialGlowCard";
import { Toast } from "@/components/ui/Toast";

type PlanDef = {
  id: SubscriptionTier;
  name: string;
  kanji: string;
  priceYen: number;
  cadence: string;
  badge?: string;
  tagline: string;
  glow: "gold" | "crimson" | "cyan";
  features: string[];
};

const PLANS: PlanDef[] = [
  {
    id: "free",
    name: "Ronin Traveler",
    kanji: "浪人",
    priceYen: 0,
    cadence: "Free Forever",
    tagline: "Essential sky tools for amateur stargazers and wanderers.",
    glow: "cyan",
    features: [
      "Live Open-Meteo weather forecasts & cloud cover tracking",
      "Explainable 5-Factor Night Honor Score (0–100 suitability rating)",
      "In-Browser Classical Astro Photo Enhancement (Unsharp Masking)",
      "In-Browser Candidate Star Point & Nebular clump detector",
      "Real-time Moon Phase & Illumination via astronomy-engine",
      "Curated 2026 Meteor Showers & Eclipses timeline",
      "Interactive Leaflet Dark Sky Map with 6 observatories",
    ],
  },
  {
    id: "samurai",
    name: "Samurai Stargazer",
    kanji: "侍",
    priceYen: 1000,
    cadence: "1,000 円 / month",
    badge: "Most Popular · 最も人気",
    tagline: "For dedicated astrophotographers & field stargazing samurai.",
    glow: "gold",
    features: [
      "Everything in Ronin Free, plus:",
      "Neural Real-ESRGAN x4 AI Super-Resolution (Python FastAPI service)",
      "Live ISS orbital pass predictions with horizon elevation angles",
      "Launch Library 2 live rocket launches with countdown slip alerts",
      "Multi-Site Dark Sky Comparison Radar (compare up to 6 observatories)",
      "In-Tab Stargazing Browser Notification Alarms",
      "240 Honor Points Guild Passport & Samurai Clan Crest",
    ],
  },
  {
    id: "shogun",
    name: "Shogun Commander",
    kanji: "将軍",
    priceYen: 1500,
    cadence: "1,500 円 / month",
    badge: "Supreme Guild · 最高峰",
    tagline: "Supreme commander access for astronomical observatories and deep-sky expeditions.",
    glow: "crimson",
    features: [
      "Everything in Samurai Stargazer, plus:",
      "Priority Deep-Sky AI Restoration Queue with high-res tiled inference",
      "Full Astronomical Source Catalog Extraction (up to 80 detected sources)",
      "Custom Night Honor Score Tuning (calibrate weights for your optical rig)",
      "Exportable Stargazing Session Logs (CSV & JSON format)",
      "Offline TLE Ephemeris Cache for off-grid mountain expeditions",
      "500 Honor Points Grand Marshal Bonus & Golden Shogun Emblem",
    ],
  },
];

export function SubscriptionPlans() {
  const { user, selectPlan } = useAuth();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSelect = (plan: PlanDef) => {
    selectPlan(plan.id);
    if (plan.id === "free") {
      setToastMsg("Switched to Ronin Free Tier. All core celestial tools remain unlocked.");
    } else {
      setToastMsg(`Congratulations! Upgraded to ${plan.name} (${plan.kanji}) at ${plan.cadence}.`);
    }
  };

  return (
    <section id="subscription-plans" className="scroll-mt-20 space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase tracking-[0.32em] text-[var(--gold)] font-medium">
          ⛩️ 階級の道 · GUILD MEMBERSHIP TIERS
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--gold-soft)] sm:text-4xl">
          Choose Your Celestial Path
        </h2>
        <p className="text-sm text-[var(--mist)] leading-relaxed">
          From wandering Ronin stargazers to supreme Shogun observatory commanders. Upgrade to unlock neural AI super-resolution, live orbital tracking, and precision deep-sky catalogs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = user.plan === plan.id;
          return (
            <CelestialGlowCard
              key={plan.id}
              glowColor={plan.glow}
              className={`flex flex-col justify-between p-6 ${
                isCurrent ? "ring-2 ring-[var(--gold)]" : ""
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-lg text-[var(--crimson-bright)]">
                        {plan.kanji}
                      </span>
                      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--gold-soft)]">
                        {plan.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-[var(--mist)]">{plan.tagline}</p>
                  </div>

                  {plan.badge ? (
                    <span className="rounded-full bg-[var(--crimson)] px-2.5 py-0.5 text-[10px] font-semibold text-white whitespace-nowrap shadow-[0_0_8px_rgba(196,69,77,0.6)]">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                {/* Price Display */}
                <div className="my-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-[var(--moonlight)] sm:text-4xl">
                      {plan.priceYen === 0 ? "0 円" : `${plan.priceYen.toLocaleString()} 円`}
                    </span>
                    <span className="text-xs text-[var(--mist)]">
                      {plan.priceYen === 0 ? "/ free forever" : "/ month (月)"}
                    </span>
                  </div>
                  {plan.priceYen > 0 && (
                    <p className="mt-1 text-[11px] text-[var(--gold)]">
                      Simulated subscription · Instant tier activation
                    </p>
                  )}
                </div>

                {/* Feature List */}
                <ul className="space-y-2.5 text-xs text-[var(--mist)] border-t border-[var(--border)] pt-4">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--gold-soft)] font-bold">✓</span>
                      <span className={feat.startsWith("Everything") ? "text-[var(--gold-soft)] font-medium" : ""}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => handleSelect(plan)}
                  className={`w-full rounded-sm py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                    isCurrent
                      ? "bg-[rgba(196,163,90,0.18)] text-[var(--gold-soft)] border border-[var(--gold)] cursor-default"
                      : plan.id === "shogun"
                        ? "bg-[var(--crimson)] text-white hover:bg-[var(--crimson-bright)] shadow-[0_0_12px_rgba(196,69,77,0.5)]"
                        : plan.id === "samurai"
                          ? "bg-[var(--gold)] text-[var(--void)] hover:bg-[var(--gold-soft)] font-bold shadow-[0_0_12px_rgba(196,163,90,0.5)]"
                          : "border border-[var(--border)] text-[var(--moonlight)] hover:border-[var(--gold)]"
                  }`}
                >
                  {isCurrent ? "✓ Active Tier" : plan.priceYen === 0 ? "Select Ronin Free" : `Join as ${plan.name} →`}
                </button>
              </div>
            </CelestialGlowCard>
          );
        })}
      </div>

      <Toast message={toastMsg} onClose={() => setToastMsg(null)} tone="success" />
    </section>
  );
}


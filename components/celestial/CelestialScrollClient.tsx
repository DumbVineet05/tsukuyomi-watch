"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MoonPhaseDisplay } from "@/components/ui/MoonPhaseDisplay";
import { Toast } from "@/components/ui/Toast";
import type { CelestialEvent, CelestialEventType } from "@/lib/events/types";
import type { MoonPhaseInfo } from "@/lib/moon/phase";

const ALL_TYPES: CelestialEventType[] = [
  "meteor_shower",
  "eclipse",
  "moon_phase",
  "iss_pass",
  "rocket_launch",
];

export function CelestialScrollClient() {
  const [events, setEvents] = useState<CelestialEvent[]>([]);
  const [moon, setMoon] = useState<MoonPhaseInfo | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<CelestialEvent | null>(null);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<CelestialEventType[]>([...ALL_TYPES]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [lat, setLat] = useState("28.6139");
  const [lon, setLon] = useState("77.209");
  const [toast, setToast] = useState<string | null>(null);
  const [reminders, setReminders] = useState<string[]>([]);
  const [asOfTimestamp, setAsOfTimestamp] = useState<number>(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        lat,
        lon,
      });
      if (query.trim()) params.set("q", query.trim());
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (types.length && types.length < ALL_TYPES.length) {
        params.set("types", types.join(","));
      }
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load events");
      setEvents(data.events ?? []);
      setMoon(data.moon ?? null);
      setWarnings(data.warnings ?? []);
      setAsOfTimestamp(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [from, lat, lon, query, to, types]);

  useEffect(() => {
    let cancelled = false;
    async function initialFetch() {
      try {
        const params = new URLSearchParams({
          lat,
          lon,
        });
        if (query.trim()) params.set("q", query.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (types.length && types.length < ALL_TYPES.length) {
          params.set("types", types.join(","));
        }
        const res = await fetch(`/api/events?${params.toString()}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error || "Failed to load events");
        setEvents(data.events ?? []);
        setMoon(data.moon ?? null);
        setWarnings(data.warnings ?? []);
        setAsOfTimestamp(Date.now());
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void initialFetch();
    return () => {
      cancelled = true;
    };
  }, [from, lat, lon, query, to, types]);

  const upcoming = useMemo(() => {
    if (!asOfTimestamp) return events;
    const cutoff = asOfTimestamp - 86400000;
    return events.filter((e) => Date.parse(e.startTime) >= cutoff);
  }, [events, asOfTimestamp]);

  function toggleType(t: CelestialEventType) {
    setTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  }

  async function requestReminder(event: CelestialEvent) {
    if (!("Notification" in window)) {
      setToast("Browser notifications are not supported here.");
      return;
    }
    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      setToast("Notification permission not granted.");
      return;
    }

    setReminders((prev) =>
      prev.includes(event.id) ? prev : [...prev, event.id],
    );
    setToast(
      `In-app reminder set for “${event.title}”. Notifications only fire while this tab remains open.`,
    );

    const start = Date.parse(event.startTime);
    const delay = start - Date.now() - 30 * 60 * 1000;
    if (delay > 0 && delay < 2147483647) {
      window.setTimeout(() => {
        new Notification("Tsukuyomi Watch reminder", {
          body: `${event.title} begins around ${event.startTime} (UTC).`,
        });
      }, delay);
    } else if (delay <= 0) {
      new Notification("Tsukuyomi Watch reminder", {
        body: `${event.title} is already near/at its start time.`,
      });
    }
  }

  return (
    <div className="space-y-6">
      {moon ? <MoonPhaseDisplay moon={moon} /> : null}

      <div className="ink-panel space-y-4 rounded-md p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events"
            className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm"
            aria-label="From date"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm"
            aria-label="To date"
          />
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-sm bg-[var(--crimson)] px-3 py-2 text-sm hover:bg-[var(--crimson-bright)]"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={`rounded-sm border px-2 py-1 text-xs uppercase tracking-wide ${
                types.includes(t)
                  ? "border-[var(--gold)] text-[var(--gold-soft)]"
                  : "border-[var(--border)] text-[var(--mist)]"
              }`}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-[var(--mist)]">
            Observer lat (ISS)
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm text-[var(--moonlight)]"
            />
          </label>
          <label className="text-xs text-[var(--mist)]">
            Observer lon (ISS)
            <input
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="mt-1 w-full rounded-sm border border-[var(--border)] bg-[rgba(5,7,13,0.6)] px-3 py-2 text-sm text-[var(--moonlight)]"
            />
          </label>
        </div>
      </div>

      {warnings.length > 0 ? (
        <div className="rounded-md border border-[rgba(184,134,11,0.4)] bg-[rgba(184,134,11,0.08)] px-4 py-3 text-sm text-[var(--gold-soft)]">
          <ul className="list-disc space-y-1 pl-4">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={() => void load()} /> : null}

      {!loading && !error && upcoming.length === 0 ? (
        <EmptyState
          title="No events match"
          message="Try clearing filters or widening the date range."
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {upcoming.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              selected={selected?.id === event.id}
              onSelect={setSelected}
            />
          ))}
        </div>
        <div className="ink-panel h-fit rounded-md p-4">
          {selected ? (
            <>
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--gold)]">
                {selected.type.replace("_", " ")}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--moonlight)]">
                {selected.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--mist)]">
                {selected.description}
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div>
                  <dt className="text-[var(--mist)]">Start (UTC)</dt>
                  <dd>{selected.startTime}</dd>
                </div>
                {selected.endTime ? (
                  <div>
                    <dt className="text-[var(--mist)]">End (UTC)</dt>
                    <dd>{selected.endTime}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-[var(--mist)]">Source</dt>
                  <dd>
                    {selected.sourceUrl ? (
                      <a
                        href={selected.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--gold-soft)] underline"
                      >
                        {selected.source}
                      </a>
                    ) : (
                      selected.source
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--mist)]">Provenance</dt>
                  <dd>{selected.dataProvenance}</dd>
                </div>
                {selected.visibilityGuidance ? (
                  <div>
                    <dt className="text-[var(--mist)]">Viewing notes</dt>
                    <dd>{selected.visibilityGuidance}</dd>
                  </div>
                ) : null}
              </dl>
              <button
                type="button"
                onClick={() => void requestReminder(selected)}
                className="mt-4 rounded-sm border border-[var(--border-strong)] px-3 py-2 text-sm text-[var(--gold-soft)]"
              >
                {reminders.includes(selected.id)
                  ? "Reminder armed"
                  : "Set in-tab reminder"}
              </button>
              <p className="mt-2 text-[11px] text-[var(--mist)]">
                Reminders use the browser Notification API and only work while this
                tab is open. No push infrastructure is configured.
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--mist)]">
              Select an event to inspect details and source attribution.
            </p>
          )}
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}

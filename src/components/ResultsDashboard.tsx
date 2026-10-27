/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Clock, MapPin, Plane, Calendar } from "lucide-react";

export function ResultsDashboard({ results, searchParams }: { results: any[]; searchParams?: any }) {
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Normal" | "Flexible Date" | "Flexible Route">("All");

  if (!results || results.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="font-serif text-2xl mb-2">No flights found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria (radius, dates, etc).
        </p>
      </div>
    );
  }

  const categorizeFlight = (flight: any) => {
    if (!searchParams) return "Normal";

    const isSameOrigin = flight.departure.airport.toUpperCase() === searchParams.origin.toUpperCase();
    const isSameDest = flight.arrival.airport.toUpperCase() === searchParams.destination.toUpperCase();
    const isSameRoute = isSameOrigin && isSameDest;

    const flightDate = flight.departure.time.split(" ")[0]; // Extract YYYY-MM-DD
    const isSameDate = flightDate === searchParams.dates.start;

    if (isSameRoute && isSameDate) return "Normal";
    if (!isSameDate) return "Flexible Date";
    return "Flexible Route";
  };

  const categorizedResults = results.map(f => ({ ...f, category: categorizeFlight(f) }));

  const filteredResults = categorizedResults.filter(
    (r) => selectedCategory === "All" || r.category === selectedCategory
  );

  const topPick = filteredResults.find((r) => r.tags?.includes("Top Pick")) || filteredResults[0];
  const others = filteredResults.filter((r) => r.id !== topPick?.id);

  const toggleDetails = (id: string) => {
    setSelectedFlightId(selectedFlightId === id ? null : id);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timeStr: string) => {
    if (!timeStr) return "";
    const date = new Date(timeStr);
    return date.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const renderDetails = (flight: any) => {
    if (!flight.rawDetails || !flight.rawDetails.flights) return null;

    return (
      <div className="mt-6 pt-6 border-t border-border space-y-6">
        <h4 className="font-mono uppercase tracking-wider text-xs text-muted-foreground">
          Itinerary Details
        </h4>
        <div className="space-y-4">
          {flight.rawDetails.flights.map((leg: any, i: number) => (
            <div key={i} className="bg-surface/50 rounded-xl p-4 border border-border/50">
              <div className="flex items-center gap-2 mb-3 font-medium">
                <Plane className="size-4 text-amber" />
                {leg.departure_airport.id} → {leg.arrival_airport.id}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase mb-1">
                    Departs
                  </div>
                  <div>{formatTime(leg.departure_airport.time)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase mb-1">
                    Arrives
                  </div>
                  <div>{formatTime(leg.arrival_airport.time)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase mb-1">
                    Flight
                  </div>
                  <div>
                    {leg.airline} {leg.flight_number}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground font-mono text-[10px] uppercase mb-1">
                    Duration
                  </div>
                  <div>{leg.duration} min</div>
                </div>
              </div>
              {flight.rawDetails.layovers && flight.rawDetails.layovers[i] && (
                <div className="mt-3 inline-flex items-center gap-2 text-xs font-mono bg-surface-elevated px-3 py-1.5 rounded-full text-muted-foreground">
                  <Clock className="size-3.5" />
                  Layover in {flight.rawDetails.layovers[i].name} (
                  {flight.rawDetails.layovers[i].id}) for {flight.rawDetails.layovers[i].duration}{" "}
                  min
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Category Filter Bar */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center p-1.5 bg-surface/80 backdrop-blur border border-border rounded-full shadow-elevated">
          {["All", "Normal", "Flexible Date", "Flexible Route"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-amber text-amber-foreground shadow-glow scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-surface/30">
          <h3 className="font-serif text-2xl mb-2">No {selectedCategory.toLowerCase()} flights found</h3>
          <p className="text-muted-foreground">
            Try selecting a different category or adjusting your search.
          </p>
        </div>
      ) : (
        <>
          {/* Top Pick */}
          {topPick && (
            <section>
              <div className="text-xs font-mono uppercase tracking-wider text-amber mb-3 flex items-center justify-between">
                <span>FlexiRoute Top Pick</span>
                {topPick.category !== "Normal" && (
                  <span className="bg-amber/10 text-amber px-2 py-0.5 rounded-md border border-amber/20">
                    {topPick.category}
                  </span>
                )}
              </div>
              <div className="rounded-2xl bg-gradient-amber p-[1px]">
                <div className="rounded-2xl bg-background/95 backdrop-blur p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl mb-2">
                  {topPick.departure.airport} → {topPick.arrival.airport}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
                  <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border text-foreground font-medium">
                    <Calendar className="size-3.5 text-amber" /> {formatDate(topPick.departure.time)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border">
                    <Plane className="size-3.5" /> {topPick.airline}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border">
                    <Clock className="size-3.5" /> {topPick.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-surface px-2.5 py-1 rounded-md border border-border">
                    <MapPin className="size-3.5" />{" "}
                    {topPick.layover === 0
                      ? "Direct"
                      : `${topPick.layover} stop${topPick.layover === 1 ? "" : "s"}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-serif text-amber">${topPick.price}</div>
                <button
                  onClick={() => toggleDetails(topPick.id)}
                  className="whitespace-nowrap inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border hover:bg-surface transition-colors text-sm"
                >
                  {selectedFlightId === topPick.id ? "Hide details" : "View details"}
                </button>
              </div>
            </div>
            {selectedFlightId === topPick.id && renderDetails(topPick)}
          </div>
        </div>
      </section>
      )}

      {/* Others */}
      {others.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl">Other great options</h3>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground bg-surface px-3 py-1 rounded-full border border-border">
              {others.length} results
            </span>
          </div>
          <div className="space-y-3">
            {others.map((flight) => (
              <div
                key={flight.id}
                className="rounded-xl bg-surface/50 border border-border p-4 hover:border-border/80 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-lg">
                          {flight.departure.airport} → {flight.arrival.airport}
                        </h4>
                        <div className="flex gap-2">
                          {flight.tags?.includes("Cheapest") && (
                            <span className="text-[10px] uppercase font-mono tracking-wider bg-amber/20 text-amber px-2 py-0.5 rounded-sm">
                              Lowest price
                            </span>
                          )}
                          {flight.category !== "Normal" && (
                            <span className="text-[10px] uppercase font-mono tracking-wider bg-surface-elevated text-muted-foreground border border-border px-2 py-0.5 rounded-sm">
                              {flight.category}
                            </span>
                          )}
                        </div>
                      </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="text-foreground font-medium flex items-center gap-1">
                        <Calendar className="size-3" /> {formatDate(flight.departure.time)}
                      </span>
                      <span>·</span>
                      <span>{flight.airline}</span>
                      <span>·</span>
                      <span>{flight.duration}</span>
                      <span>·</span>
                      <span>
                        {flight.layover === 0
                          ? "Direct"
                          : `${flight.layover} stop${flight.layover === 1 ? "" : "s"}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-serif">${flight.price}</div>
                    <button
                      onClick={() => toggleDetails(flight.id)}
                      className="text-sm font-medium hover:text-amber transition-colors"
                    >
                      {selectedFlightId === flight.id ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>
                {selectedFlightId === flight.id && renderDetails(flight)}
                </div>
              ))}
            </div>
          </section>
        )}
        </>
      )}
    </div>
  );
}

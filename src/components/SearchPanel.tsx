import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeftRight, MapPin, Calendar, Sliders, Plane } from "lucide-react";

export interface SearchParams {
  origin: string;
  destination: string;
  dates: { start: string; end?: string };
  tripType: "round-trip" | "one-way";
  radius: number;
  maxLayover: number;
  flexDays: number;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export function SearchPanel({
  onSearch,
  isLoading,
}: {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}) {
  const [radius, setRadius] = useState(100);
  const [layover, setLayover] = useState(4);
  const [trip, setTrip] = useState<"round" | "one">("round");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [flexDays, setFlexDays] = useState(0);
  const [airports, setAirports] = useState<any[]>([]);

  useEffect(() => {
    fetch("/iata_airports.json")
      .then(res => res.json())
      .then(data => setAirports(data))
      .catch(err => console.error("Failed to load airports", err));
  }, []);

  const handleSearch = () => {
    if (!origin || !destination || !startDate) {
      alert("Please fill in origin, destination, and start date.");
      return;
    }
    if (trip === "round" && !endDate) {
      alert("Please fill in a return date for round trips.");
      return;
    }
    onSearch({
      origin,
      destination,
      dates: { start: startDate, end: trip === "round" ? endDate : undefined },
      tripType: trip === "round" ? "round-trip" : "one-way",
      radius,
      maxLayover: layover,
      flexDays,
    });
  };

  const getAirportsInRadiusCount = (iataCode: string) => {
    if (!iataCode || airports.length === 0) return 0;
    const target = airports.find(a => a.iata.toUpperCase() === iataCode.toUpperCase());
    if (!target) return 0;
    const nearby = airports.filter(a => getDistance(target.lat, target.lon, a.lat, a.lon) <= radius);
    return nearby.length; 
  };

  const originCount = getAirportsInRadiusCount(origin);
  const destCount = getAirportsInRadiusCount(destination);
  
  const originHint = originCount > 1 ? `${originCount} airports in radius` : originCount === 1 ? `1 airport in radius` : `Enter valid IATA`;
  const destHint = destCount > 1 ? `${destCount} airports in radius` : destCount === 1 ? `1 airport in radius` : `Enter valid IATA`;

  return (
    <div className="relative w-full max-w-5xl rounded-2xl bg-surface/80 backdrop-blur-xl border border-border shadow-elevated p-2">
      <div className="rounded-xl bg-surface-elevated/60 p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex rounded-full bg-background/50 p-1 text-xs font-mono uppercase tracking-wider">
            {(["round", "one"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrip(t)}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  trip === t
                    ? "bg-amber text-amber-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "round" ? "Round trip" : "One way"}
              </button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span className="size-1.5 rounded-full bg-amber animate-pulse" />
            FLEXIROUTE ENGINE · LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr] gap-3 items-stretch">
          <Field
            icon={<MapPin className="size-4" />}
            label="From"
            placeholder="e.g. LAX"
            hint={originHint}
            value={origin}
            onChange={(v) => setOrigin(v)}
            airports={airports}
          />
          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            <button 
              onClick={() => {
                setOrigin(destination);
                setDestination(origin);
              }}
              className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-surface hover:text-foreground hover:border-amber/50 transition-colors cursor-pointer group/swap"
              title="Swap origin and destination"
            >
              <ArrowLeftRight className="size-4 transition-transform group-hover/swap:scale-110" />
            </button>
          </div>
          <Field
            icon={<MapPin className="size-4" />}
            label="To"
            placeholder="e.g. JFK"
            hint={destHint}
            value={destination}
            onChange={(v) => setDestination(v)}
            airports={airports}
          />
          <div className="flex flex-col gap-2">
            <Field
              type="date"
              icon={<Calendar className="size-4" />}
              label="Departure"
              placeholder=""
              hint={flexDays > 0 ? `± ${flexDays} days` : "Exact date"}
              value={startDate}
              onChange={(v) => setStartDate(v)}
            />
            {trip === "round" && (
              <Field
                type="date"
                icon={<Calendar className="size-4" />}
                label="Return"
                placeholder=""
                hint={flexDays > 0 ? `± ${flexDays} days` : "Exact date"}
                value={endDate}
                onChange={(v) => setEndDate(v)}
              />
            )}
            
            <div className="flex items-center justify-between px-3 py-1.5 border border-border/50 bg-surface/30 rounded-lg mt-1 hover:border-amber/40 transition-colors">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Flexibility</span>
              <select 
                value={flexDays} 
                onChange={(e) => setFlexDays(Number(e.target.value))} 
                className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
              >
                <option value={0} className="bg-background">Exact Dates</option>
                <option value={1} className="bg-background">± 1 Day</option>
                <option value={2} className="bg-background">± 2 Days</option>
                <option value={3} className="bg-background">± 3 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <SliderRow
            label="Driving radius"
            value={`${radius} mi`}
            min={25}
            max={250}
            step={25}
            v={radius}
            onChange={setRadius}
          />
          <SliderRow
            label="Max layover"
            value={layover === 0 ? "Direct only" : `${layover}h`}
            min={0}
            max={12}
            step={2}
            v={layover}
            onChange={setLayover}
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {["Carry-on only", "Avoid overnight", "Best value"].map((t) => (
              <span
                key={t}
                className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full bg-background/40 border border-border text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <button
            disabled={isLoading}
            onClick={handleSearch}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-amber px-7 py-3.5 text-sm font-medium text-amber-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-100 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="size-4 border-2 border-amber-foreground/30 border-t-amber-foreground rounded-full animate-spin" />
            ) : (
              <Plane className="size-4 -rotate-45" />
            )}
            {isLoading ? "Scanning matrix..." : "Scan the matrix"}
            {!isLoading && (
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  placeholder,
  hint,
  value,
  onChange,
  type = "text",
  airports,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  hint: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  airports?: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredAirports = (airports || [])
    .filter(a => 
      a.iata.toLowerCase().includes((value || "").toLowerCase()) ||
      a.name.toLowerCase().includes((value || "").toLowerCase())
    )
    .slice(0, 50);

  return (
    <label 
      ref={wrapperRef}
      className="group relative flex-1 block rounded-xl bg-background/40 border border-border px-4 py-3 transition-colors focus-within:border-amber/60 hover:border-border/80 cursor-pointer"
      onClick={(e) => {
        if (type === "date") {
          const input = e.currentTarget.querySelector("input");
          if (input && 'showPicker' in input) {
            try { (input as any).showPicker(); } catch (err) {}
          }
        }
      }}
    >
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-mono">
        {icon}
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="mt-1 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground cursor-pointer"
      />
      <div className="text-[11px] text-amber/80 font-mono mt-0.5">{hint}</div>
      
      {type === "text" && airports && isOpen && value && value.length > 0 && (
        <div className="absolute z-50 top-[calc(100%+0.5rem)] left-0 right-0 bg-surface/95 backdrop-blur-xl border border-border rounded-xl shadow-elevated max-h-60 overflow-y-auto">
          {filteredAirports.length > 0 ? (
            filteredAirports.map(a => (
              <div 
                key={a.iata}
                className="px-4 py-3 hover:bg-surface-elevated cursor-pointer transition-colors border-b border-border/50 last:border-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onChange) onChange(a.iata);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-amber bg-amber/10 px-1.5 py-0.5 rounded text-xs">{a.iata}</span>
                  <span className="text-sm text-foreground truncate">{a.name}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">No matching airports found</div>
          )}
        </div>
      )}
    </label>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  v,
  onChange,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <Sliders className="size-3.5" /> {label}
        </div>
        <div className="text-sm font-serif italic text-amber">{value}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-amber"
      />
    </div>
  );
}

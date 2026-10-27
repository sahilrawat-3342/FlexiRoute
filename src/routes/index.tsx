/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-clouds.jpg";
import { SearchPanel, SearchParams } from "@/components/SearchPanel";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { ArrowUpRight, Compass, Layers, Sparkles, Plane } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "FlexiRoute — Find flights between every possibility" },
      {
        name: "description",
        content:
          "FlexiRoute scans nearby airports, flexible dates, and layover limits to surface the absolute cheapest way to fly.",
      },
    ],
  }),
});

function Index() {
  const [searchState, setSearchState] = useState<"idle" | "loading" | "results" | "error">("idle");
  const [results, setResults] = useState<any[]>([]);
  const [currentParams, setCurrentParams] = useState<SearchParams | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (params: SearchParams) => {
    setSearchState("loading");
    setCurrentParams(params);
    setErrorMsg("");
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.data);
        setSearchState("results");
        setTimeout(() => {
          document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setSearchState("error");
        setErrorMsg(data.error || "Search failed");
      }
    } catch (error) {
      console.error(error);
      setSearchState("error");
      setErrorMsg("Failed to connect to backend. Is the server running?");
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Nav />
      <Hero onSearch={handleSearch} isLoading={searchState === "loading"} />

      {searchState === "error" && (
        <div className="max-w-5xl mx-auto my-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-center font-medium">
          {errorMsg}
        </div>
      )}

      {searchState === "results" && (
        <div
          id="results-section"
          className="py-20 px-6 md:px-10 border-y border-border bg-surface/20"
        >
          <ResultsDashboard results={results} searchParams={currentParams} />
        </div>
      )}

      {(searchState === "idle" || searchState === "error") && (
        <>
          <Marquee />
          <Features />
          <Matrix />
        </>
      )}
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="absolute top-0 inset-x-0 z-30">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 text-foreground">
          <div className="size-8 rounded-full bg-gradient-amber grid place-items-center text-amber-foreground">
            <Plane className="size-4 -rotate-45" />
          </div>
          <span className="font-serif text-2xl tracking-tight">FlexiRoute</span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#how" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#matrix" className="hover:text-foreground transition-colors">
            The matrix
          </a>
          <a href="#" className="hover:text-foreground transition-colors">
            Pricing
          </a>
        </nav>
        <a
          href="#search"
          className="text-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border hover:bg-surface transition-colors"
        >
          Sign in <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </header>
  );
}

function Hero({
  onSearch,
  isLoading,
}: {
  onSearch: (p: SearchParams) => void;
  isLoading: boolean;
}) {
  return (
    <section className="relative pt-32 md:pt-40 pb-24">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroImg}
          alt="Airplane wing above clouds at golden hour"
          className="w-full h-[80vh] object-cover opacity-60"
          width={1920}
          height={1280}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/60 backdrop-blur border border-border text-xs font-mono uppercase tracking-wider text-muted-foreground mb-8">
            <Sparkles className="size-3.5 text-amber" />A search engine for the flexible
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance">
            Fly cheaper by being <em className="text-amber not-italic">a little</em> flexible.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-balance">
            FlexiRoute scans every airport within driving distance, every nearby date, and every
            reasonable layover — in a single search. Then it shows you the one that saves the most.
          </p>
        </div>

        <div id="search" className="mt-16 flex justify-center">
          <SearchPanel onSearch={onSearch} isLoading={isLoading} />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["LAX → JFK", "BUR → EWR", "SNA → LGA", "ONT → HPN", "LGB → JFK", "LAX → EWR"];
  return (
    <div className="border-y border-border py-6 overflow-hidden">
      <div className="flex gap-12 animate-[float-slow_8s_ease-in-out_infinite] justify-around flex-wrap text-muted-foreground font-mono text-sm">
        {items.map((i) => (
          <span key={i} className="flex items-center gap-3">
            <span className="size-1 rounded-full bg-amber" /> {i}{" "}
            <span className="text-amber">−$237</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: Compass,
      title: "Smart radius",
      body: "We map every commercial airport within your driving range and search them in parallel — not one at a time.",
      stat: "Up to 250 mi",
    },
    {
      icon: Layers,
      title: "Flexible matrix",
      body: "Cross-reference flexible dates, layover limits, and time-of-day windows. No more 40 browser tabs.",
      stat: "± 7 days",
    },
    {
      icon: Sparkles,
      title: "Best-value sort",
      body: "An algorithm weighs the dollars saved against the extra drive and layover hours. The honest winner rises to the top.",
      stat: "1 click",
    },
  ];
  return (
    <section id="how" className="py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber mb-3">
              / 01 · The engine
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight max-w-2xl text-balance">
              One search.
              <br />
              Every reasonable possibility.
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md">
            Traditional engines lock you to one airport and one date. We unlock the whole matrix and
            let you set the rules.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl bg-surface border border-border p-8 hover:border-amber/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="size-12 rounded-xl bg-background/60 grid place-items-center text-amber">
                  <f.icon className="size-5" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
              </div>
              <div className="font-serif text-3xl mb-3">{f.title}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Max
                </span>
                <span className="font-serif italic text-amber text-lg">{f.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Matrix() {
  const dates = ["Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16"];
  const routes = [
    { r: "LAX → JFK", prices: [389, 412, 367, 401, 445] },
    { r: "BUR → EWR", prices: [298, 312, 287, 334, 356] },
    { r: "SNA → LGA", prices: [421, 398, 376, 389, 423] },
    { r: "ONT → JFK", prices: [356, 367, 342, 378, 401] },
  ];
  const min = Math.min(...routes.flatMap((r) => r.prices));

  return (
    <section id="matrix" className="py-32 px-6 md:px-10 bg-surface/40 border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start mb-16">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-amber mb-3">
              / 02 · The matrix view
            </div>
            <h2 className="font-serif text-4xl md:text-6xl leading-tight tracking-tight text-balance">
              See every price <em className="text-amber">at once.</em>
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Dates across the top. Route combinations down the side. The cheapest cell glows. It's
            the way flight search should have always worked.
          </p>
        </div>

        <div className="rounded-2xl bg-background border border-border p-6 md:p-8 shadow-elevated overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-xs font-mono uppercase tracking-wider text-muted-foreground font-normal pb-3">
                  Route
                </th>
                {dates.map((d) => (
                  <th
                    key={d}
                    className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-normal pb-3"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routes.map((row) => (
                <tr key={row.r}>
                  <td className="text-sm font-mono text-foreground pr-4 py-1">{row.r}</td>
                  {row.prices.map((p, i) => (
                    <td key={i} className="text-center">
                      <div
                        className={`rounded-lg py-3 px-2 text-sm transition-colors ${
                          p === min
                            ? "bg-gradient-amber text-amber-foreground font-medium shadow-glow"
                            : "bg-surface text-foreground hover:bg-surface-elevated"
                        }`}
                      >
                        ${p}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
              FlexiRoute Top Pick
            </div>
            <div className="font-serif text-2xl">
              BUR → EWR · Mar 14 · <span className="text-amber italic">$287</span>
            </div>
            <button className="inline-flex items-center gap-2 text-amber hover:gap-3 transition-all text-sm font-medium">
              Book this flight <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-6 md:px-10 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-amber p-12 md:p-20 text-amber-foreground relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="font-serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-balance">
              The cheapest seat is one search away.
            </h3>
            <p className="mt-6 text-amber-foreground/80 text-lg max-w-lg">
              Free during beta. No account required. Just tell us where, when-ish, and how far
              you'll drive.
            </p>
            <a
              href="#search"
              className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-background text-foreground text-sm font-medium hover:scale-[1.02] transition-transform"
            >
              Start a search <ArrowUpRight className="size-4" />
            </a>
          </div>
          <Plane
            className="absolute -right-12 -bottom-12 size-80 text-amber-foreground/10 -rotate-12"
            strokeWidth={0.5}
          />
        </div>

        <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-gradient-amber" />
            <span className="font-serif text-lg text-foreground">FlexiRoute</span>
            <span className="font-mono text-xs ml-2">v1.0 · 2026</span>
          </div>
          <div className="font-mono text-xs uppercase tracking-wider">
            Built for the flexible · Powered by data
          </div>
        </div>
      </div>
    </footer>
  );
}

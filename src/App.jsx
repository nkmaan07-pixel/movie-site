import { useEffect, useMemo, useState } from "react";
import "./index.css";

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w300";

// how many pages to auto-fetch (20 movies per page). Increase if you want more.
// TMDb limits: total_pages returned by API. We cap to avoid huge loads.
const MAX_PAGES_TO_FETCH = 5; // 5 pages => ~100 movies

export default function App() {
  const [movies, setMovies] = useState([]);
  const [totalAvailable, setTotalAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // UI state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("title-asc"); // title-asc, title-desc, rating-desc, rating-asc
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // debounce search (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      setErr(null);

      try {
        const key = import.meta.env.VITE_TMDB_API_KEY;
        if (!key) throw new Error("VITE_TMDB_API_KEY not set");

        // first request to get total_pages and results
        const firstUrl = `${TMDB_BASE}/movie/top_rated?api_key=${key}&language=en-US&page=1`;
        const firstRes = await fetch(firstUrl);
        if (!firstRes.ok) throw new Error("TMDb fetch failed: " + firstRes.status);
        const firstData = await firstRes.json();

        const totalPages = Math.min(firstData.total_pages || 1, MAX_PAGES_TO_FETCH);
        setTotalAvailable(firstData.total_results ?? null);

        const pages = [1];
        for (let p = 2; p <= totalPages; p++) pages.push(p);

        // fetch remaining pages in parallel
        const fetches = pages.slice(1).map((p) =>
          fetch(`${TMDB_BASE}/movie/top_rated?api_key=${key}&language=en-US&page=${p}`).then((r) => {
            if (!r.ok) throw new Error("TMDb fetch failed: " + r.status);
            return r.json();
          })
        );

        const rest = await Promise.all(fetches);
        const all = [firstData, ...rest].flatMap((d) => d.results || []);
        setMovies(all);
      } catch (e) {
        setErr(String(e));
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // Filter + sort computed list
  const filtered = useMemo(() => {
    let list = movies.slice();

    // search (title)
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      list = list.filter((m) => (m.title || "").toLowerCase().includes(q));
    }

    // sorting
    if (sort === "title-asc") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else if (sort === "title-desc") {
      list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    } else if (sort === "rating-desc") {
      list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sort === "rating-asc") {
      list.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    }

    return list;
  }, [movies, debouncedQuery, sort]);

  function clearFilters() {
    setQuery("");
    setSort("title-asc");
  }

  if (loading) return <div className="centerMessage">Loading top movies…</div>;
  if (err)
    return (
      <div className="centerMessage error">
        <strong>Error:</strong> {err}
        <div style={{ marginTop: 8, fontSize: 13 }}>
          Make sure you set <code>VITE_TMDB_API_KEY</code> (local `.env` or Vercel env var) and redeploy.
        </div>
      </div>
    );

  return (
    <div className="appWrap">
      <header className="topBar">
        <div className="searchRow">
          <input
            aria-label="Search movies"
            placeholder="Search movies by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="searchInput"
          />

          <div className="controls">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="select">
              <option value="title-asc">Sort: title (A–Z)</option>
              <option value="title-desc">Sort: title (Z–A)</option>
              <option value="rating-desc">Sort: rating (high → low)</option>
              <option value="rating-asc">Sort: rating (low → high)</option>
            </select>

            <button className="btn" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        <div className="metaRow">
          <div>
            Showing <strong>{filtered.length}</strong>
            {totalAvailable ? <> of <strong>{totalAvailable}</strong></> : null}
          </div>
        </div>
      </header>

      <main>
        <div className="grid">
          {filtered.map((m) => (
            <div key={m.id} className="card">
              {m.poster_path ? (
                <img src={IMAGE_BASE + m.poster_path} alt={m.title} className="poster" />
              ) : (
                <div className="poster placeholder" />
              )}
              <div className="cardInfo">
                <div className="title">{m.title}</div>
                <div className="meta">
                  Rating: {m.vote_average ?? "—"} · Popularity: {Math.round(m.popularity ?? 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

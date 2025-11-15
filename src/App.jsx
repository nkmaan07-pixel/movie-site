import { useEffect, useState } from "react";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [err, setErr] = useState();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, title, popularity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErr(undefined);
      try {
        const key = import.meta.env.VITE_TMDB_API_KEY;
        if (!key) throw new Error("VITE_TMDB_API_KEY not set");
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=en-US&page=1`
        );
        if (!res.ok) throw new Error("TMDb fetch failed: " + res.status);
        const data = await res.json();
        setMovies(Array.isArray(data.results) ? data.results : []);
      } catch (e) {
        console.error("Load error:", e);
        setErr(String(e));
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // filter by query
  const filtered = movies
    .filter((m) => {
      if (!query) return true;
      return (m.title || "").toLowerCase().includes(query.trim().toLowerCase());
    })
    .slice(); // copy for sort

  // sort
  if (sortBy === "title") {
    filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  } else if (sortBy === "popularity") {
    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } // default keeps API order

  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial, sans-serif", minHeight: "100vh", background: "#f6f7fb" }}>
      <h1 style={{ marginBottom: 10 }}>Top Movies</h1>

      {/* Error */}
      {err && (
        <div style={{ padding: 12, color: "#941414", background: "#ffeaea", borderRadius: 8, marginBottom: 12 }}>
          <strong>Error:</strong> {err}
          <div style={{ marginTop: 8, fontSize: 13 }}>
            Make sure <code>VITE_TMDB_API_KEY</code> is set in <code>.env</code> or in your deployment (Vercel) and restart the dev server.
          </div>
        </div>
      )}

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          background: "white",
          padding: 12,
          borderRadius: 10,
          boxShadow: "0 6px 20px rgba(8,12,20,0.06)",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movie title..."
          aria-label="Search movie title"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            minWidth: 220,
            outline: "none",
            flex: "1 1 220px",
          }}
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "white",
          }}
        >
          <option value="default">Sort: default</option>
          <option value="title">Sort: title (A–Z)</option>
          <option value="popularity">Sort: popularity</option>
        </select>

        <button
          onClick={() => { setQuery(""); setSortBy("default"); }}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>

        <div style={{ marginLeft: "auto", color: "#666", fontSize: 14 }}>
          {loading ? "Loading…" : `Showing ${filtered.length} / ${movies.length}`}
        </div>
      </div>

      {/* Loading / Empty state */}
      {loading && (
        <div style={{ padding: 20, color: "#555" }}>Loading top movies from TMDb…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: 20, color: "#666" }}>
          No movies found{query ? ` for "${query}"` : ""}.
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: 16,
        }}
      >
        {filtered.map((m) => (
          <div
            key={m.id}
            style={{
              textAlign: "center",
              borderRadius: 8,
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 6px 14px rgba(8,12,20,0.06)",
              display: "flex",
              flexDirection: "column",
              height: 320,
            }}
          >
            {m.poster_path ? (
              <img
                alt={m.title || "Poster"}
                src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                style={{ width: "100%", display: "block", height: 220, objectFit: "cover" }}
              />
            ) : (
              <div style={{ height: 220, background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#999" }}>No image</div>
              </div>
            )}
            <div style={{ padding: 10, fontSize: 14, flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{m.title || "Untitled"}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Rating: {m.vote_average ?? "—"} · Popularity: {m.popularity ?? "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

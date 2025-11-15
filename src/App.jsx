import { useEffect, useState } from "react";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [err, setErr] = useState();

  useEffect(() => {
    async function load() {
      try {
        const key = import.meta.env.VITE_TMDB_API_KEY;
        if (!key) throw new Error("VITE_TMDB_API_KEY not set");

        const res = await fetch(
          `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&language=en-US&page=1`
        );

        if (!res.ok) throw new Error("TMDb fetch failed: " + res.status);

        const data = await res.json();
        setMovies(data.results || []);
      } catch (e) {
        console.error(e);
        setErr(String(e));
      }
    }

    load();
  }, []);

  if (err)
    return (
      <div style={{ padding: 20, color: "red" }}>
        Error: {err}
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h1>Top Movies</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 16,
        }}
      >
        {movies.map((m) => (
          <div key={m.id} style={{ textAlign: "center" }}>
            {m.poster_path ? (
              <img
                alt={m.title}
                src={"https://image.tmdb.org/t/p/w300" + m.poster_path}
                style={{ width: "100%", borderRadius: 8 }}
              />
            ) : (
              <div style={{ height: 210, background: "#ddd" }} />
            )}
            <div style={{ marginTop: 8 }}>{m.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import movies from './data/movies';
import MovieCard from './components/MovieCard';
import Header from './components/Header';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; // set this in Vercel env vars
const TMDB_SEARCH = 'https://api.themoviedb.org/3/search/movie?query=';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w342';

export default function App(){
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [posters, setPosters] = useState({}); // rank -> poster path
  const filtered = useMemo(()=>{
    return movies.filter(m=> (genre==='All' || (m.genres||[]).includes(genre)) && m.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, genre]);

  useEffect(()=>{
    if(!TMDB_API_KEY) return;
    // Fetch posters for visible movies only (to save requests)
    const visible = movies.slice(0, 100); // we'll fetch for all top 100, rate-limit friendly
    visible.forEach(async (m)=>{
      if(posters[m.rank]) return;
      try{
        const resp = await fetch(`${TMDB_SEARCH}${encodeURIComponent(m.title)}&year=${m.year}&api_key=${TMDB_API_KEY}`);
        const json = await resp.json();
        const result = json.results && json.results[0];
        if(result && result.poster_path){
          setPosters(prev => ({...prev, [m.rank]: result.poster_path}));
        } else if(result && result.backdrop_path){
          setPosters(prev => ({...prev, [m.rank]: result.backdrop_path}));
        } else {
          setPosters(prev => ({...prev, [m.rank]: null}));
        }
      }catch(e){
        console.error('TMDb error', e);
        setPosters(prev => ({...prev, [m.rank]: null}));
      }
    });
  }, []); // run once

  const genres = useMemo(()=>{
    const s = new Set();
    movies.forEach(m=> (m.genres||[]).forEach(g=>s.add(g)));
    return ['All', ...Array.from(s).sort()];
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <div className="max-w-6xl mx-auto p-6">
        <Header />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <input aria-label="Search" placeholder="Search title, year..." className="md:col-span-2 p-3 rounded-lg bg-gray-800 border border-gray-700" value={query} onChange={e=>setQuery(e.target.value)} />
          <select value={genre} onChange={e=>setGenre(e.target.value)} className="p-3 rounded-lg bg-gray-800 border border-gray-700">
            {genres.map(g=> <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <section className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.map(m=> (
            <MovieCard key={m.rank} movie={m} poster={posters[m.rank] ? `${TMDB_IMAGE_BASE}${posters[m.rank]}` : null} />
          ))}
        </section>

        <footer className="mt-10 text-sm text-gray-400">Posters fetched via TMDb. Set <code>VITE_TMDB_API_KEY</code> in environment variables (Vercel) for poster images.</footer>
      </div>
    </div>
  );
}

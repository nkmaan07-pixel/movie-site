import React, { useState } from 'react';

export default function MovieCard({ movie, poster }){
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-lg transform hover:scale-105 transition-all" >
      <div className="h-56 bg-gray-800 flex items-center justify-center">
        {poster ? <img src={poster} alt={movie.title} className="h-full w-full object-cover"/> : <div className="text-gray-500">No Image</div>}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold">{movie.rank}. {movie.title} <span className="text-sm text-gray-400">({movie.year})</span></h3>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{movie.tagline || movie.description || ''}</p>
          </div>
          <div className="text-sm text-yellow-400 font-semibold">{movie.rating || ''}</div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={()=>setOpen(true)} className="px-3 py-1 bg-indigo-600 rounded text-sm">Details</button>
          <a className="px-3 py-1 border rounded text-sm" href={`https://www.imdb.com/find?q=${encodeURIComponent(movie.title)}`} target="_blank" rel="noreferrer">IMDB</a>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={()=>setOpen(false)}>
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6" onClick={e=>e.stopPropagation()}>
            <div className="flex gap-4">
              <div className="w-36 h-52 bg-gray-800 overflow-hidden rounded-lg">
                {poster ? <img src={poster} alt={movie.title} className="w-full h-full object-cover"/> : <div className="text-gray-500 p-4">No Image</div>}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{movie.title} <span className="text-gray-400 text-sm">({movie.year})</span></h2>
                <p className="text-gray-300 mt-2">{movie.description || movie.tagline || 'No description available.'}</p>
                <div className="mt-4 text-sm text-gray-400">Genres: {(movie.genres||[]).join(', ')}</div>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button onClick={()=>setOpen(false)} className="px-4 py-2 bg-gray-700 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import stations from '../data/stations.json';

type FavouriteJourney = {
  from: string;
  to: string;
};

const Favourites: React.FC = () => {
  const [favourites, setFavourites] = useState<FavouriteJourney[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('favourite');
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  const handleClick = (fav: FavouriteJourney) => {
    navigate(`/results?from=${fav.from}&to=${fav.to}`);
  };

  const getStationName = (code: string): string => {
    const match = stations.find(station => station.crsCode === code);
    return match ? match.stationName : code;
  };

  return (
   <div className='text-highlight space-y-4'>
    <div className='flex items-center justify-between gap-4'>
      <div>
        <h2 className='text-xl font-semibold'>My favourite journeys</h2>
        <p className='text-xs text-highlight/70 mt-1'>Quick access to your saved routes</p>
      </div>
      <button
        type='button'
        className='rounded-sm p-1 text-highlight/80 transition hover:text-highlight'
        aria-label='Add new journey'
        onClick={() => navigate('/')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
          strokeLinecap='round'
            strokeLinejoin='round'
          className='transition duration-150 group-hover:scale-110'
        >
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" /> <path d="M9 12h6" /> <path d="M12 9v6" />
        </svg>
      </button>
    </div>

    {favourites.length === 0 ? (
      <div className='rounded-sm border border-highlight/30 bg-darkblue/60 px-4 py-3 text-sm text-highlight/75'>
        No saved trips yet. Add one from results and it will appear here.
      </div>
    ) : (
      <ul className='space-y-3'>
        {favourites.map((fav, index) => (
          <li
            key={index}
            className='group border border-highlight rounded-sm px-4 py-3 bg-darkblue hover:bg-highlight/10 transition'
          >
            <button
              type='button'
              onClick={() => handleClick(fav)}
              className='w-full flex items-center justify-between text-highlight group-hover:text-white'
            >
              <div className='flex flex-col items-start'>
                <span className='text-sm'>{getStationName(fav.from)}</span>
                <span className='text-xs text-highlight/70'>to {getStationName(fav.to)}</span>
              </div>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1' >
                <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
};

export default Favourites;

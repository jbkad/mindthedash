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
   <div className='text-highlight'>
    <h2 className='mb-4'>My favourite journeys</h2>
    <ul className='space-y-3'>
      {favourites.map((fav, index) => (
        <li
          key={index}
          className='group border border-highlight rounded-sm px-4 py-2 bg-darkblue hover:bg-highlight/10 transition'
        >
          <a
            href={`/results?from=${fav.from}&to=${fav.to}`}
            className='flex justify-between items-center text-highlight group-hover:text-white'
          >
            <span>{getStationName(fav.from)} to {getStationName(fav.to)}</span>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 group-hover:translate-x-1 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='1' >
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  </div>
  );
};

export default Favourites;

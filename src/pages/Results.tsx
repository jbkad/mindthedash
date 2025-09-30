import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [departures, setDepartures] = useState<any[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const handleSaveFavourite = () => {
    if (!from || !to || !departures.length) return;

    const journey = { from, to };
    const saved = localStorage.getItem('favourite');
    let favourites = saved ? JSON.parse(saved) : [];

    const index = favourites.findIndex((fav: any) => fav.from === from && fav.to === to);

    if (index !== -1) {
      favourites.splice(index, 1);
      setIsFavourite(false);
      setAlertMessage('Journey removed from favourites.');
    } else {
      favourites.push(journey);
      setIsFavourite(true);
      setAlertMessage('Journey added to favourites!');
    }

    localStorage.setItem('favourite', JSON.stringify(favourites));

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  useEffect(() => {
    const fetchDepartures = async () => {
      try {
        const res = await fetch(`http://localhost:8000/departures?station=${from}&station_detail=destination,calling_at&to_offset=PT02:30:00`);
        const data = await res.json();

        const filtered = (data?.departures?.all || []).filter((dep: any) => {
          const isFinalStop = dep.station_detail?.destination?.station_code === to;
          const isCalledAt = dep.calling_at?.some((stop: any) => stop.station_code === to);
          return isFinalStop || isCalledAt;
        });

        setDepartures(filtered);
        const saved = localStorage.getItem('favourite');
        const favourites = saved ? JSON.parse(saved) : [];

        if (filtered.length > 0) {
          const alreadySaved = favourites.some((fav: any) => fav.from === from && fav.to === to);
          setIsFavourite(alreadySaved);
        }

      } catch (err) {
        setError('Could not fetch departures');
      } finally {
        setLoading(false);
      }
    };

    if (from && to) fetchDepartures();
  }, [from, to]);

  if (!from || !to) return <p>Missing query parameters.</p>;
  if (loading) return <p>Loading…</p>;
  if (error) return <p className='text-red-500'>{error}</p>;
  if (departures.length === 0) return <p>No departures found to {to}.</p>;

  return (
    <div>
      {showAlert && (
        <Alert 
          message={alertMessage} 
          onClose={() => setShowAlert(false)} 
        />
      )}

      <div className='flex justify-between mb-6'>
        <h2>{from} → {to}</h2>
        <button onClick={handleSaveFavourite}>
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill={isFavourite ? '#FFCC00' : 'none'} stroke='#FFCC00' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round' className='false ? hover:fill-highlight : "" '> <path d='M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8' /> </svg>
        </button>
      </div>

      <ul className='space-y-2'>
        {departures.map((dep, index) => (
          <li key={index} className='border border-highlight rounded-sm p-3 bg-darkblue text-highlight'>
            <div className='flex items-center justify-between text-sm'>
              <p>{dep.aimed_departure_time}</p>
              <p>Platform {dep.platform}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className='pt-8 pb-8 text-xs text-center'>
        Note: these results are based on past data. Please check before you travel.
      </p>
    </div>
  );
};

export default Results;

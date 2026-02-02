import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [departures, setDepartures] = useState<any[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const apiURL = process.env.REACT_APP_API_URL;

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
      setIsLoading(true);
      setError('');
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      try {
        const res = await fetch(`${apiURL}?station=${from}`, { signal: controller.signal });
        const data = await res.json();

      const filtered = (data?.departures?.all || []).filter((dep: any) => {
        const isFinalStop = dep.station_detail?.destination?.station_code === to;
        const isCallingAt = dep.station_detail?.calling_at?.some((s: any) => s.station_code === to);
        return isFinalStop || isCallingAt;
      });

        setDepartures(filtered.slice(0, 8));
        const saved = localStorage.getItem('favourite');
        const favourites = saved ? JSON.parse(saved) : [];

        if (filtered.length > 0) {
          const alreadySaved = favourites.some((fav: any) => fav.from === from && fav.to === to);
          setIsFavourite(alreadySaved);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setError('Timed out after 1 minute. Please try again.');
        } else {
          setError('Unable to fetch departures. Please try again.');
        }
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    if (from && to) fetchDepartures();
  }, [from, to, apiURL]);

  if (!from || !to) return <p>Missing query parameters.</p>;
  if (error) return <p className='text-red-500'>{error}</p>;
  if (isLoading) return <p className='text-highlight/70'>Loading...</p>;
  if (departures.length === 0) return <p className='text-highlight/70'>No direct services found today.</p>;

  const parseTime = (value: string | null | undefined) => {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  };

  const getDelayInfo = (dep: any) => {
    if (dep.is_cancelled || dep.expected_departure_time === 'Cancelled') {
      return { label: 'Cancelled', isDelayed: true, minutes: null };
    }

    const std = parseTime(dep.aimed_departure_time);
    const etd = parseTime(dep.expected_departure_time);

    if (!dep.expected_departure_time || dep.expected_departure_time === 'On time') {
      return { label: 'On time', isDelayed: false, minutes: 0 };
    }

    if (dep.expected_departure_time === 'Delayed') {
      return { label: 'Delayed', isDelayed: true, minutes: null };
    }

    if (std !== null && etd !== null) {
      const diff = Math.max(0, etd - std);
      if (diff > 0) {
        return { label: `Expected ${dep.expected_departure_time} (+${diff}m)`, isDelayed: true, minutes: diff };
      }
    }

    return { label: dep.expected_departure_time, isDelayed: false, minutes: null };
  };

  return (
    <div className='space-y-6'>
      {showAlert && (
        <Alert 
          message={alertMessage} 
        />
      )}

      <div className='flex items-start justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>{from} → {to}</h2>
          <p className='text-xs text-highlight/70 mt-1'>Direct services only • Live updates</p>
        </div>
        <button onClick={handleSaveFavourite}>
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill={isFavourite ? '#FFCC00' : 'none'} stroke='#FFCC00' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round' className='false ? hover:fill-highlight : "" '> <path d='M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8' /> </svg>
        </button>
      </div>

      <ul className='space-y-3'>
        {departures.map((dep, index) => {
          const hasInfo = Boolean(dep.delay_reason || dep.cancel_reason);
          const isOpen = openIndex === index;
          const info = getDelayInfo(dep);
          const showDelayBanner = info.isDelayed || info.label === 'Cancelled';
          const bannerText = hasInfo
            ? (dep.cancel_reason || dep.delay_reason)
            : (info.label === 'Cancelled' ? 'Service cancelled' : 'Service delayed');
          return (
          <li
            key={index}
            className={`border border-highlight rounded-sm p-4 bg-darkblue text-highlight shadow-sm transition ${hasInfo ? ' hover:shadow-lg hover:shadow-black/20' : ''}`}
            onClick={() => hasInfo && setOpenIndex(isOpen ? null : index)}
            role={hasInfo ? 'button' : undefined}
            aria-expanded={hasInfo ? isOpen : undefined}
          >
            <div className='flex items-center justify-between gap-2 text-sm'>

              <div className='min-w-[72px]'>
                {(() => {
                  const isCancelled = info.label === 'Cancelled';
                  const isDelayed = info.isDelayed && !isCancelled;
                  const showExpected = isDelayed && typeof dep.expected_departure_time === 'string' && /^\d{2}:\d{2}$/.test(dep.expected_departure_time);
                  const displayTime = showExpected ? dep.expected_departure_time : dep.aimed_departure_time;
                  return (
                    <>
                      <p className={`font-semibold text-lg tabular-nums ${isDelayed || isCancelled ? 'text-red-400' : ''}`}>
                        {displayTime}
                        {isDelayed && info.minutes ? (
                          <sup className='relative text-[10px] ml-1 -top-[1.75em] left-[-0.5em]'>+{info.minutes}</sup>
                        ) : null}
                      </p>
                      {isCancelled ? (
                        <p className='text-xs mt-1 text-red-400'>Cancelled</p>
                      ) : null}
                    </>
                  );
                })()}
              </div>

              <div className='flex flex-col flex-grow min-w-0'>
                <p className='truncate font-medium text-base'>{dep.destination_name}</p>
                <p className='text-xs font-light text-highlight/70 truncate'>{dep.operator_name}</p>
                {showDelayBanner && (
                  <div className='mt-1 text-xs text-red-300'>
                    <span>{bannerText}.</span>
                    {info.minutes !== null && info.minutes >= 15 && (
                     <span>
                      Subject to your train operator,
                     <a
                        className='text-xs items-center underline'
                        href='https://support.thetrainline.com/en/support/solutions/articles/78000000555-my-uk-train-was-delayed-can-i-claim-compensation-'
                        target='blank'
                      >
                       delay compensation
                      </a>
                     </span>
                    )}
                     {" "}may be available.
                  </div>
                )}
                
              </div>

              <div className='flex flex-col items-end gap-1'>
                <p className='bg-highlight text-black text-xs px-2 py-1 rounded-sm font-medium whitespace-nowrap'>
                  {!dep.platform || dep.platform === 'null' ? 'TBC' : `Platform ${dep.platform}`}
                </p>
              </div>
            </div>
          </li>
        )})}
      </ul>

      <div className='pt-2 pb-6'>
        <div className='mx-auto max-w-xl rounded-sm border border-highlight/30 bg-darkblue/60 px-4 py-3 text-xs text-highlight/70'>
          Results are based on scheduled data plus live updates. Always check before you travel.
        </div>
      </div>
    </div>
  );
};

export default Results;

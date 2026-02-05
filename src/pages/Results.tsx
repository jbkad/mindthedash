import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';

const Results: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [departures, setDepartures] = useState<any[]>([]);
  const [isFavourite, setIsFavourite] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const apiURL = process.env.REACT_APP_API_URL;

  const from = searchParams.get('from');
  const to = searchParams.get('to');

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
        return { label: `Expected ${dep.expected_departure_time}`, isDelayed: true, minutes: diff };
      }
    }

    return { label: dep.expected_departure_time, isDelayed: false, minutes: null };
  };

  const roundUpToQuarterHour = (value: number) => Math.ceil(value / 15) * 15;

  const getNationalRailUrl = (dep: any) => {
    const two = (value: number) => String(value).padStart(2, '0');
    const now = new Date();
    const [day, month, year] = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
      .format(now)
      .split('/');

    const leavingDate = `${day}${month}${year}`;
    const departureTime = dep.aimed_departure_time;
    const [rawHour, rawMin] = departureTime && /^\d{2}:\d{2}$/.test(departureTime)
      ? departureTime.split(':')
      : ['00', '00'];

    const roundedTotal = roundUpToQuarterHour(Number(rawHour) * 60 + Number(rawMin));
    const normalizedTotal = roundedTotal >= 24 * 60 ? 0 : roundedTotal;
    const leavingHour = two(Math.floor(normalizedTotal / 60));
    const leavingMin = two(normalizedTotal % 60);

    return `https://www.nationalrail.co.uk/journey-planner/?type=single&origin=${from || ''}&destination=${to || ''}&leavingType=departing&leavingDate=${leavingDate}&leavingHour=${leavingHour}&leavingMin=${leavingMin}&adults=1&extraTime=0#TD`;
  };

  const handleSaveFavourite = () => {
    if (!from || !to || !departures.length) return;

    const journey = { from, to };
    const saved = localStorage.getItem('favourite');
    const favourites = saved ? JSON.parse(saved) : [];
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
        if (!res.ok) throw new Error(`API returned ${res.status}`);
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

    if (from && to && apiURL) fetchDepartures();
  }, [from, to, apiURL]);

  if (!from || !to) return <p>Missing query parameters.</p>;
  if (error) return <p className='text-red-500'>{error}</p>;
  if (isLoading) return <p className='text-highlight/70'>Loading...</p>;
  if (departures.length === 0) {
    return <p className='text-highlight/70'>No direct services found between {from} and {to} in the next few hours.</p>;
  }

  return (
    <div className='space-y-6'>
      {showAlert && <Alert message={alertMessage} />}

      <div className='flex items-start justify-between gap-2'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight'>{from} → {to}</h2>
          <p className='mt-1 text-xs text-highlight/70'>Direct services only • Live updates</p>
        </div>
        <button onClick={handleSaveFavourite} aria-label='Toggle favourite journey'>
          <svg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill={isFavourite ? '#FFCC00' : 'none'} stroke='#FFCC00' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M17.286 21.09q -1.69 .001 -5.288 -2.615q -3.596 2.617 -5.288 2.616q -2.726 0 -.495 -6.8q -9.389 -6.775 2.135 -6.775h.076q 1.785 -5.516 3.574 -5.516q 1.785 0 3.574 5.516h.076q 11.525 0 2.133 6.774q 2.23 6.802 -.497 6.8' />
          </svg>
        </button>
      </div>

      <ul className='space-y-3'>
        {departures.map((dep, index) => {
          const info = getDelayInfo(dep);
          const hasInfo = Boolean(dep.delay_reason || dep.cancel_reason);
          const showDelayBanner = info.isDelayed || info.label === 'Cancelled';
          const bannerText = hasInfo
            ? (dep.cancel_reason || dep.delay_reason)
            : (info.label === 'Cancelled' ? 'Service cancelled' : 'Service delayed');
          const isCancelled = info.label === 'Cancelled';
          const isDelayed = info.isDelayed && !isCancelled;
          const displayTime = dep.aimed_departure_time;
          const isInteractive = !isCancelled && !isDelayed;
          const nationalRailUrl = getNationalRailUrl(dep);
          const platformClasses = isCancelled ? 'bg-highlight/50' : 'bg-highlight';
          const statusText = isCancelled ? 'Cancelled' : isDelayed ? 'Delayed' : 'On time';
          const cardContent = (
            <>
              {showDelayBanner && (
                <div className='bg-highlight/10 text-highlight rounded-t-sm border-x-0 border-y border-t-0 border-highlight px-3 py-2 text-xs'>
                  <div className='flex items-center gap-2'>
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M12 9v4' /><path d='M12 17h.01' /><path d='M10.3 3.8 1.9 18a2 2 0 0 0 1.7 3h16.8a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z' />
                    </svg>
                    <span>
                      {bannerText}.
                      {info.minutes !== null && info.minutes >= 15 && (
                        <> Subject to your train operator, delay compensation may be available.</>
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className={`px-4 py-4 ${isCancelled ? 'bg-darkblue/50 text-highlight/50 opacity-60' : ''}`}>
                <div className='flex items-center justify-between gap-2 text-sm'>
                  <div className='min-w-[72px]'>
                    <p className='font-semibold text-lg tabular-nums text-highlight'>
                      {displayTime}
                      {isDelayed && info.minutes ? (
                        <sup className='relative text-[10px] ml-1 -top-[1.75em] left-[-0.5em] text-highlight'>+{info.minutes}</sup>
                      ) : null}
                    </p>
                  </div>

                  <div className='flex min-w-0 flex-grow flex-col'>
                    <p className='truncate text-base font-medium'>{dep.destination_name}</p>
                    <div className='flex items-center text-xs font-light'>
                      <p className={`${isCancelled ? 'text-highlight/50' : 'text-highlight/70'} truncate`}>{dep.operator_name}</p>
                      <span className='px-1 text-highlight/50'>•</span>
                      <p className={`${isCancelled ? 'text-highlight/50' : 'text-highlight/70'} `}>{statusText}</p>
                    </div>
                  </div>

                  <div className='flex flex-col items-end gap-1'>
                    <p className={`${platformClasses} whitespace-nowrap rounded-sm px-2 py-1 text-xs font-medium text-black`}>
                      {isCancelled ? '—' : !dep.platform || dep.platform === 'null' ? 'TBC' : `Platform ${dep.platform}`}
                    </p>
                  </div>
                </div>
              </div>
            </>
          );

          return (
            <li className='border border-highlight rounded-sm bg-darkblue text-highlight shadow-sm transition hover:bg-darkblue/50' key={index}>
              {isInteractive ? (
                <a href={nationalRailUrl} target='_blank' rel='noreferrer' className='block'>
                  {cardContent}
                </a>
              ) : (
                <div className='block'>{cardContent}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className='pt-2 pb-6 text-highlight/70 text-xs text-center'>
          Information is provided as-is and may change at short notice. Please check before you travel.
        </div>
    </div>
  );
};

export default Results;

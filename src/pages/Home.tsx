import React, { useState, useEffect } from 'react';
import { Alert } from '../components/Alert';
import stations from '../data/stations.json';
import '../index.css';

const Home: React.FC = () => {
  const [fromQuery, setFromQuery] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<Station[]>([]);

  const [toQuery, setToQuery] = useState('');
  const [toStation, setToStation] = useState('');
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [toSuggestions, setToSuggestions] = useState<Station[]>([]);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const apiURL = process.env.REACT_APP_API_URL;

  type Station = {
    stationName: string;
    lat: number;
    long: number;
    crsCode: string;
    constituentCountry: string;
    iataAirportCode?: string;
  };

  const handleSubmit = async () => {
    if (!fromStation || !toStation) return;

    setAlertMessage('Checking your journey...')
    setShowAlert(true);

    try {
      const res = await fetch(`${apiURL}?station=${fromStation}`);
      const data = await res.json();
      const departures = data?.departures?.all || [];

      const validJourney = departures.some((dep: any) => {
        const stationObj = stations.find(s => s.crsCode === toStation);

        return dep.station_detail?.destination?.station_code === toStation;
      });

      console.log('Final decision — validJourney:', validJourney);

      if (validJourney) {
        window.location.href = `/results?from=${fromStation}&to=${toStation}`;
      } else {
        setAlertMessage(`No direct trains found between ${fromStation} and ${toStation}.`);
        setTimeout(() => setShowAlert(false), 3000);
        setFromQuery('');
        setToQuery('');
      }
    } catch (err) { console.error('Validation failed:', err); 
      setAlertMessage('Could not validate your journey. Please try again.');
      setTimeout(() => setShowAlert(false), 3000);
    } finally {
      setTimeout(() => setShowAlert(false), 3000);
    }
  };

  useEffect(() => {
    if (fromQuery.length > 1) {
      const filtered = stations.filter(station =>
        station.stationName.toLowerCase().includes(fromQuery.toLowerCase()) ||
        station.crsCode.toLowerCase().includes(fromQuery.toLowerCase()) ||
        station.iataAirportCode?.toLowerCase().includes(fromQuery.toLowerCase())
      );

      setFromSuggestions(filtered.slice(0, 5));
    } else {
      setFromSuggestions([]);
    }
  }, [fromQuery]);

  useEffect(() => {
    if (toQuery.length > 1) {
      const filtered = stations.filter(station =>
        station.stationName.toLowerCase().includes(toQuery.toLowerCase()) ||
        station.crsCode.toLowerCase().includes(toQuery.toLowerCase()) ||
        station.iataAirportCode?.toLowerCase().includes(toQuery.toLowerCase())
      );

      setToSuggestions(filtered.slice(0, 5));
    } else {
      setToSuggestions([]);
    }
  }, [toQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      setShowFromSuggestions(false);
      setShowToSuggestions(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFromSelect = (station: Station) => {
    setFromQuery(`${station.stationName} (${station.crsCode})`);
    setFromStation(station.crsCode);
    setShowFromSuggestions(false);
  };

  const handleToSelect = (station: any) => {
    setToQuery(`${station.stationName} (${station.crsCode})`);
    setToStation(station.crsCode);
    setShowToSuggestions(false);
  };


  return (
    <div className='w-full'>
      {showAlert && (
        <Alert 
          message={alertMessage} 
        />
      )}
      <p>Get real-time platform information for UK train departures before it hits the boards. No more last-minute dashes or guesswork.</p>
      <div className='flex flex-col items-center'>

        <div className='mt-5 mb-2.5 w-full'>
          <label className='block text-sm'>From</label>
          <div className='mt-1'>
            <div className='relative grid shrink-0 grid-cols-1'>
              <input
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                className='col-start-1 row-start-1 w-full appearance-none rounded-sm bg-darkblue border border-highlight hover:bg-highlight/10 transition focus:border-highlight py-1.5 pl-3 pr-7 text-base text-highlight placeholder:text-gray-500 focus:outline-none sm:text-sm/6'
              />
              {fromSuggestions.length > 0 && (
                <ul className='absolute left-0 right-0 z-10 mt-[42px] w-full shadow-xl bg-highlight rounded-sm max-h-56 overflow-y-auto'>
                  {fromSuggestions.map((station, index) => (
                    <li
                      key={index}
                      onClick={() => handleFromSelect(station)}
                      className='px-4 py-2 text-black hover:bg-[#edc31a] cursor-pointer text-sm'
                    >
                      {station.stationName} ({station.crsCode})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className='mt-2.5 mb-5 w-full'>
          <label className='block text-sm'>To</label>
          <div className='mt-1'>
            <div className='relative grid shrink-0 grid-cols-1'>
              <input
                value={toQuery}
                onChange={(e) => setToQuery(e.target.value)}
                className='disabled:cursor-not-allowed col-start-1 row-start-1 w-full appearance-none rounded-sm bg-darkblue border border-highlight border-highlight hover:bg-highlight/10 transition py-1.5 pl-3 pr-7 text-base text-highlight placeholder:text-gray-500 focus:outline-none sm:text-sm/6'
                disabled={!fromStation}
              />
              {toSuggestions.length > 0 && (
                <ul className='absolute left-0 right-0 z-10 mt-[42px] w-full shadow-xl bg-highlight rounded-sm max-h-56 overflow-y-auto'>
                  {toSuggestions.map((station, index) => (
                    <li
                      key={index}
                      onClick={() => handleToSelect(station)}
                      className='px-4 py-2 text-black hover:bg-[#edc31a] cursor-pointer text-sm'
                    >
                      {station.stationName} ({station.crsCode})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <button
          type='button'
          className='disabled:cursor-not-allowed bg-highlight text-black text-sm hover:underline hover:underline-offset-4 w-full p-2.5 mt-5 mb-5 rounded-sm'
          onClick={handleSubmit}
          disabled={!fromStation || !toStation}
        >
          Check my train
        </button>

        <a
          href='/favourites'
          className='mt-2 text-sm text-highlight hover:underline hover:underline-offset-4'
        >
          My favourite journeys
        </a>
      </div>
    </div>
  );
};

export default Home;

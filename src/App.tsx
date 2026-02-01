import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Results from './pages/Results';
import Favourites from './pages/Favourites';
import Error from './pages/Error';
import './index.css';

const App: React.FC = () => {
  const [clock, setClock] = useState('--:--:-- BST');

  const currYear = new Date().getFullYear();

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setClock(`${h}:${m}:${s} BST`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='max-w-lg px-4 py-8 m-auto text-highlight'>
      <div className='flex justify-between items-center mb-8'>
        <a href='/' className='text-md text-lg hover:underline hover:underline-offset-4'>Mind The Dash</a>
        <div className='pt-1 pb-1 pl-2.5 pr-2.5 bg-highlight text-black rounded-sm'>{clock}</div>
      </div>
      <div className='min-h-[500px]'>
        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
              <Route path='/about' element={<About />} /> 
              <Route path='/results' element={<Results />} /> 
              <Route path='/favourites' element={<Favourites />} />
            <Route path='/*' element={<Error />} />
          </Routes>
        </Router>
      </div>
      <div className='flex flex-col items-center justify-between mt-[50px]'>
        <a href='/about' className='mb-1 text-sm hover:underline hover:underline-offset-4'>About</a>
        <a href='/favourites' className='mb-1 text-sm hover:underline hover:underline-offset-4'>Favourites</a>
        <div className='mt-5 text-sm text-highlight/75'>MTD {currYear}</div>
      </div>
    </div>
  );
};

export default App;

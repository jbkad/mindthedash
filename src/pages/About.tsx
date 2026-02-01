
const About: React.FC = () => {
    return (
        <div className='flex flex-col gap-6 text-justify justify-center text-highlight'>
            <div>
                <p className='text-sm text-highlight/70'>About</p>
                <h2 className='text-2xl font-semibold tracking-tight mt-1'>Mind the Dash</h2>
            </div>
            <p>Mind the Dash was born from one infuriating truth: UK train stations often post platform information at the very last minute.</p>
            <div className='rounded-sm border border-highlight/30 bg-darkblue/60 p-3'>
                <img src={require("../assets/station-board.png")} alt="Station board" className='w-full rounded-sm' />
            </div>
            <p>As a regular commuter, I found myself sprinting across train stations far too often, so I built a real-time platform checker designed to give you a head start. Inspired by the look of classic UK departure boards, it lets you see where your train is likely to depart from before it hits the boards.</p>
            <p>If you've ever legged it through a station, this one's for you.</p>
            <div className='flex items-center gap-2 w-fit text-black text-sm bg-highlight px-3 py-2 rounded-sm hover:underline hover:underline-offset-2'>
                <a href='https://joycekadibu.com/projects/mindthedash/' target='blank'>
                    How was it built?
                </a>
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6' /><path d='M11 13l9 -9' /><path d='M15 4h5v5' />
                </svg>
            </div>
        </div>
    );
};

export default About;

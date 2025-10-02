
const About: React.FC = () => {
    return (
        <div className='flex flex-col gap-6 text-justify justify-center'>
            <p>About</p>
            <p>Mind the Dash was born from one infuriating truth: UK train stations often post platform information at the very last minute.</p>
            <p>As a regular commuter, I found myself sprinting across train stations far too often, so I built a real-time platform checker designed to give you a head start. Inspired by the look of classic UK departure boards, it lets you see where your train is likely to depart from before it hits the boards.</p>
            <p>If you've ever legged it through a station, this one's for you.</p>
            <div className='flex items-center justif-center gap-2 w-fit text-lightblue text-sm bg-highlight hover:underline hover:underline-offset-2'>
                <a href='https://joycekadibu.com/projects/mindthedash/' target='blank'>
                    How was it built?
                </a>
                <svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'>
                    <path d='M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6' /><path d='M11 13l9 -9' /><path d='M15 4h5v5' />
                </svg>
            </div>
        </div>
    );
};

export default About;
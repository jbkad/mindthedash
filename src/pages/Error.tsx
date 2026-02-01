const Error: React.FC = () => {
    return (
        <div className='flex flex-col mt-5 mb-2.5 w-full items-center text-center text-highlight'>
            <p className="w-[350px] mb-5 text-lg font-semibold">platform: 404</p>
            <div className='rounded-sm border border-highlight/30 bg-darkblue/60 p-3'>
                <img src={require("../assets/error.gif")} alt="Man falls down on train"  className="w-[300px]"/>
            </div>
            <p className="w-[325px] mt-5 text-sm text-highlight">Looks like this route was cancelled. Head back to departures.</p>
            {/* <p className="mt-2 text-sm text-highlight/70">Looks like this route was cancelled. Head back to departures.</p> */}
            {/* <a href='/' className='mt-4 text-sm text-highlight hover:underline hover:underline-offset-4'>Back to home</a> */}
            <a  href='/'className='flex items-center gap-2 mt-6 w-fit text-black text-sm bg-highlight px-3 py-2 rounded-sm hover:underline hover:underline-offset-2'>
                Back to home
            </a>
        </div>
    )
}

export default Error;

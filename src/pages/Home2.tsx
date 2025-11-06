const Home2: React.FC = () => {
    return (
        <div className='flex flex-col mt-5 mb-2.5 w-full justify-center text-center'>
            <img src={require('../assets/train.gif')} alt='Train on a track' />
            <p className='mt-5'>This site is currently going through some changes, please check back soon!</p>
        </div>
    )
}

export default Home2;
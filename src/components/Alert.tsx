type AlertProps = {
  message: string;
};

const Alert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[#1f1b1b] px-6 py-4 shadow-lg text-white text-center border border-highlight">
      <p className='text-sm'>{message}</p>
    </div>
  );
};

export { Alert };
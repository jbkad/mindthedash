type AlertProps = {
  message: string;
  onClose: () => void;
};

const Alert: React.FC<AlertProps> = ({ message, onClose }) => {
  return (
    <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-[#1f1b1b] px-6 py-4 shadow-lg text-white border border-highlight">
      <div className='flex items-center justify-between gap-6'>
        <p className='text-sm'>{message}</p>
        <button
          onClick={onClose}
          className='rounded-full px-3 py-1 text-sm font-semibold text-black bg-pink-300 hover:bg-pink-400'
        >
          OK
        </button>
      </div>
    </div>
  );
};

export { Alert };
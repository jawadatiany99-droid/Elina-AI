import React from 'react';

const Spinner: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 my-8">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle 
            className="stroke-cyan-500/30"
            cx="50" cy="50" r="45" fill="none" strokeWidth="4"
          />
          <circle 
            className="stroke-cyan-400 animate-[spin_1.5s_linear_infinite]"
            style={{ transformOrigin: '50% 50%', strokeDasharray: '120, 283', strokeLinecap: 'round' }}
            cx="50" cy="50" r="45" fill="none" strokeWidth="5"
          />
           <circle 
            className="stroke-purple-500/50"
            cx="50" cy="50" r="35" fill="none" strokeWidth="2"
          />
           <circle 
            className="stroke-purple-400 animate-[spin_3s_linear_infinite_reverse]"
            style={{ transformOrigin: '50% 50%', strokeDasharray: '80, 220', strokeLinecap: 'round' }}
            cx="50" cy="50" r="35" fill="none" strokeWidth="3"
          />
        </svg>
      </div>
      {message && <p className="text-cyan-200 text-center tracking-widest text-sm">{message}</p>}
    </div>
  );
};

export default Spinner;
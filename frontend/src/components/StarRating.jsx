import React, { useState } from 'react';

const StarRating = ({ onRate }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
        Rate the help received
      </p>
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={`text-4xl transition-all transform active:scale-90 ${
              (hover || rating) >= star ? 'text-amber-400' : 'text-slate-200'
            }`}
            onClick={() => {
              setRating(star);
              onRate(star);
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="mt-2 text-sm font-bold text-indigo-600 animate-pulse">
          {rating} / 5 Selected
        </p>
      )}
    </div>
  );
};

export default StarRating;
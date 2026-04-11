import React from 'react';

const RatingDisplay = ({ rating, totalReviews }) => {
  // Round to 1 decimal place (e.g., 4.5)
  const formattedRating = Number(rating || 0).toFixed(1);
  
  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex text-yellow-400 text-xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {rating >= star ? '★' : '☆'}
          </span>
        ))}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 leading-none">{formattedRating}</span>
        <span className="text-slate-400 text-[10px] uppercase font-black tracking-tighter">
          {totalReviews} reviews
        </span>
      </div>
    </div>
  );
};

export default RatingDisplay;
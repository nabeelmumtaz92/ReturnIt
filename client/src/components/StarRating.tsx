import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showDecimal?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  showDecimal = true,
  size = 'md',
  interactive = false,
  onRatingChange
}: StarRatingProps) {
  const roundedRating = Math.round(rating * 10) / 10;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 >= 0.5;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className="flex items-center gap-2" data-testid="star-rating">
      <div className="flex items-center gap-0.5">
        {[...Array(maxRating)].map((_, index) => {
          const isFilled = index < fullStars;
          const isHalf = index === fullStars && hasHalfStar;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
              data-testid={`star-${index + 1}`}
            >
              {isFilled ? (
                <Star 
                  className={`${sizeClasses[size]} fill-[#f99806] text-[#f99806]`} 
                />
              ) : isHalf ? (
                <div className="relative">
                  <Star className={`${sizeClasses[size]} text-gray-300`} />
                  <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                    <Star className={`${sizeClasses[size]} fill-[#f99806] text-[#f99806]`} />
                  </div>
                </div>
              ) : (
                <Star className={`${sizeClasses[size]} text-gray-300`} />
              )}
            </button>
          );
        })}
      </div>
      {showDecimal && (
        <span 
          className={`${textSizeClasses[size]} font-semibold text-gray-700 dark:text-gray-300`}
          data-testid="rating-value"
        >
          {roundedRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface InteractiveStarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InteractiveStarRating({ 
  rating, 
  onRatingChange, 
  label,
  size = 'md'
}: InteractiveStarRatingProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <StarRating 
        rating={rating}
        size={size}
        interactive={true}
        onRatingChange={onRatingChange}
        showDecimal={false}
      />
    </div>
  );
}

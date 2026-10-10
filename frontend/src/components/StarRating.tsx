import './StarRating.css';

interface StarRatingProps {
    rating: number; // 0 = no ratings yet
}

const STARS = [1, 2, 3, 4, 5];

export default function StarRating({ rating }: StarRatingProps) {
    if (rating <= 0) return <span className="star-rating__new">New volunteer</span>;

    const filledStars = Math.round(rating);
    return (
        <span className="star-rating" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
            {STARS.map((star) => (
                <span
                    key={star}
                    className={star <= filledStars ? 'star-rating__star star-rating__star--filled' : 'star-rating__star'}
                    aria-hidden="true"
                >
                    ★
                </span>
            ))}
            <span className="star-rating__value" aria-hidden="true">{rating.toFixed(1)}</span>
        </span>
    );
}

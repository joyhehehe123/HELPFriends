import './StarRating.css';

interface StarRatingProps {
    rating: number; // 0 = no ratings yet
}

function Star() {
    return (
        <svg className="star-rating__star" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.5L7 14.3l-5.3-5 7.2-.9z" />
        </svg>
    );
}

export default function StarRating({ rating }: StarRatingProps) {
    if (rating <= 0) return <span className="star-rating__new">New volunteer</span>;

    const stars = Array.from({ length: Math.round(rating) }, (_, index) => index + 1);
    return (
        <span className="star-rating" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
            {stars.map((star) => <Star key={star} />)}
        </span>
    );
}

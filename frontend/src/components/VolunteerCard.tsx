import { type VolunteerProfile } from '../types/volunteerProfile';
import { summariseAvailability } from '../utils/dateTime';
import Button from './Button';
import StarRating from './StarRating';
import UserAvatar from './UserAvatar';
import './VolunteerCard.css';

interface VolunteerCardProps {
    volunteer: VolunteerProfile;
    isSending?: boolean;
    disabled?: boolean;
    onViewDetails: (volunteer: VolunteerProfile) => void;
    onSelect: (volunteer: VolunteerProfile) => void;
}

export default function VolunteerCard({
    volunteer,
    isSending = false,
    disabled = false,
    onViewDetails,
    onSelect,
}: VolunteerCardProps) {
    const nameId = `volunteer-${volunteer.volunteerId}-name`;
    const availability = summariseAvailability(volunteer.availability);

    return (
        <article className="match-card" aria-labelledby={nameId}>
            <UserAvatar name={volunteer.fullName} photoUrl={volunteer.profilePic} size="lg" />

            <div className="match-card__info">
                <div className="match-card__title-row">
                    <h3 id={nameId} className="match-card__name">{volunteer.fullName}</h3>
                    <StarRating rating={volunteer.rating} />
                </div>
                <p className="match-card__detail">Skills: {volunteer.skills.join(', ')}</p>
                <p className="match-card__detail match-card__detail--one-line" title={availability}>
                    Available: {availability || 'No time slots added yet'}
                </p>
            </div>

            <div className="match-card__actions">
                <Button
                    size="sm"
                    onClick={() => onViewDetails(volunteer)}
                    aria-label={`View details of ${volunteer.fullName}`}
                >
                    View details
                </Button>
                <Button
                    size="sm"
                    onClick={() => onSelect(volunteer)}
                    disabled={disabled}
                    aria-label={`Select ${volunteer.fullName} and send the request`}
                >
                    {isSending ? 'Sending...' : 'Select'}
                </Button>
            </div>
        </article>
    );
}

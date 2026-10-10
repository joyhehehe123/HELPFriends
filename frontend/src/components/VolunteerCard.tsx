import { type VolunteerProfile } from '../types/volunteerProfile';
import { summariseAvailability } from '../utils/dateTime';
import Button from './Button';
import StarRating from './StarRating';
import UserAvatar from './UserAvatar';
import './VolunteerCard.css';

interface VolunteerCardProps {
    volunteer: VolunteerProfile;
    onViewDetails: (volunteer: VolunteerProfile) => void;
    onSelect: (volunteer: VolunteerProfile) => void;
}

// Volunteer card (Figure 21)
export default function VolunteerCard({ volunteer, onViewDetails, onSelect }: VolunteerCardProps) {
    const nameId = `volunteer-${volunteer.volunteerId}-name`;
    const availability = summariseAvailability(volunteer.availability);

    return (
        <article className="volunteer-card" aria-labelledby={nameId}>
            <UserAvatar name={volunteer.fullName} photoUrl={volunteer.profilePic} />

            <div className="volunteer-card__info">
                <div className="volunteer-card__title-row">
                    <h3 id={nameId} className="volunteer-card__name">{volunteer.fullName}</h3>
                    <StarRating rating={volunteer.rating} />
                </div>
                <p className="volunteer-card__detail">
                    <span className="volunteer-card__label">Skills:</span> {volunteer.skills.join(', ')}
                </p>
                <p className="volunteer-card__detail volunteer-card__detail--one-line" title={availability}>
                    <span className="volunteer-card__label">Available:</span> {availability || 'No time slots added yet'}
                </p>
            </div>

            <div className="volunteer-card__actions">
                <Button
                    size="sm"
                    onClick={() => onViewDetails(volunteer)}
                    aria-label={`View details of ${volunteer.fullName}`}
                >
                    View details
                </Button>
                <Button size="sm" onClick={() => onSelect(volunteer)} aria-label={`Select ${volunteer.fullName}`}>
                    Select
                </Button>
            </div>
        </article>
    );
}

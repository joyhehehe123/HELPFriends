import { type VolunteerProfile } from '../types/volunteerProfile';
import { formatTimeRange, sortAvailability } from '../utils/dateTime';
import Button from './Button';
import Modal from './Modal';
import StarRating from './StarRating';
import UserAvatar from './UserAvatar';
import './VolunteerDetailsModal.css';

interface VolunteerDetailsModalProps {
    volunteer: VolunteerProfile;
    onClose: () => void;
}

export default function VolunteerDetailsModal({ volunteer, onClose }: VolunteerDetailsModalProps) {
    const titleId = `volunteer-details-${volunteer.volunteerId}`;
    const supportModes = volunteer.preferredMode === 'Both' ? ['Virtual', 'Physical'] : [volunteer.preferredMode];

    return (
        <Modal labelledBy={titleId} onClose={onClose} className="volunteer-details">
            <div className="volunteer-details__header">
                <UserAvatar name={volunteer.fullName} photoUrl={volunteer.profilePic} size="xl" />
                <div>
                    <div className="volunteer-details__title-row">
                        <h2 id={titleId} className="volunteer-details__name">
                            {volunteer.fullName} ({volunteer.studentId})
                        </h2>
                        <StarRating rating={volunteer.rating} />
                    </div>
                    {volunteer.faculty && <p className="volunteer-details__meta">{volunteer.faculty}</p>}
                    {volunteer.program && <p className="volunteer-details__meta">{volunteer.program}</p>}
                </div>
            </div>

            {volunteer.bio && (
                <section className="volunteer-details__about">
                    <h3 className="volunteer-details__about-title">About Me</h3>
                    <p>{volunteer.bio}</p>
                </section>
            )}

            <section className="volunteer-details__section">
                <h3 className="volunteer-details__section-title">Support Categories:</h3>
                <ul className="volunteer-details__chips">
                    {volunteer.supportCategories.map((category) => (
                        <li key={category} className="volunteer-details__chip">{category}</li>
                    ))}
                </ul>
            </section>

            <section className="volunteer-details__section">
                <h3 className="volunteer-details__section-title">Support Mode:</h3>
                <ul className="volunteer-details__chips">
                    {supportModes.map((mode) => (
                        <li key={mode} className="volunteer-details__chip">{mode}</li>
                    ))}
                </ul>
            </section>

            <section className="volunteer-details__section">
                <h3 className="volunteer-details__section-title">Skills:</h3>
                <ul className="volunteer-details__chips">
                    {volunteer.skills.map((skill) => (
                        <li key={skill} className="volunteer-details__chip">{skill}</li>
                    ))}
                </ul>
            </section>

            <section className="volunteer-details__section">
                <h3 className="volunteer-details__section-title">Availability:</h3>
                <ul className="volunteer-details__chips volunteer-details__chips--stacked">
                    {sortAvailability(volunteer.availability).flatMap((entry) =>
                        entry.timeSlots.map((slot) => (
                            <li key={`${entry.day}-${slot.start}`} className="volunteer-details__chip">
                                Every {entry.day} {formatTimeRange(slot.start, slot.end)}
                            </li>
                        )))}
                </ul>
            </section>

            <div className="volunteer-details__footer">
                <Button size="sm" shape="pill" className="volunteer-details__close" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
}
import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import sadCat from '../../assets/sadcat.png';
import BackLink from '../../components/BackLink';
import Button from '../../components/Button';
import VolunteerCard from '../../components/VolunteerCard';
import VolunteerDetailsModal from '../../components/VolunteerDetailsModal';
import { type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, formatSlot } from '../../utils/dateTime';
import { filterVolunteers } from './filterVolunteers';
import { fetchVolunteerProfiles, submitSupportRequest } from './supportRequestApi';
import { type SupportRequestRecord, type ValidSupportRequestDraft, type VolunteerFilters } from './types';
import './VolunteerMatching.css';

interface VolunteerMatchingProps {
    request: ValidSupportRequestDraft;
    currentUserId: string | null;
    onBack: () => void;
    onRequestSent: (record: SupportRequestRecord) => void;
}

type LoadStatus = 'loading' | 'error' | 'ready';

export default function VolunteerMatching({ request, currentUserId, onBack, onRequestSent }: VolunteerMatchingProps) {
    const [filters, setFilters] = useState<VolunteerFilters>({ skill: '' });
    const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadCount, setReloadCount] = useState(0);
    const [detailsVolunteer, setDetailsVolunteer] = useState<VolunteerProfile | null>(null);
    const [sendingTo, setSendingTo] = useState<string | null>(null); // Volunteer id while sending
    const [sendError, setSendError] = useState('');
    const timesRef = useRef<HTMLDetailsElement>(null);

    // Load volunteers (again on "Try again")
    useEffect(() => {
        let isLatestLoad = true; // Ignore old responses
        fetchVolunteerProfiles(request.category)
            .then((result) => {
                if (!isLatestLoad) return;
                setVolunteers(result);
                setStatus('ready');
            })
            .catch((error) => {
                console.error('Error loading volunteers: ', error);
                if (isLatestLoad) setStatus('error');
            });
        return () => {
            isLatestLoad = false;
        };
    }, [request.category, reloadCount]);

    // Close the time list when clicking somewhere else
    useEffect(() => {
        const closeTimes = (event: MouseEvent) => {
            if (timesRef.current && !timesRef.current.contains(event.target as Node)) timesRef.current.open = false;
        };
        document.addEventListener('click', closeTimes);
        return () => document.removeEventListener('click', closeTimes);
    }, []);

    const matches = filterVolunteers(volunteers, request, filters, currentUserId);

    // Dates and times from the form
    const slotDates = request.proposedTimeSlots
        .map((slot) => combineDateAndTime(slot.date, slot.time))
        .filter((date): date is Date => date !== null);
    const firstSlot = slotDates[0];

    const retryLoading = () => {
        setStatus('loading');
        setReloadCount((count) => count + 1);
    };

    const sendRequest = async (volunteer: VolunteerProfile) => {
        setSendingTo(volunteer.volunteerId);
        setSendError('');
        try {
            onRequestSent(await submitSupportRequest(request, volunteer, currentUserId ?? undefined));
        } catch (error) {
            console.error('Error sending support request: ', error);
            setSendError(`We couldn't send your request to ${volunteer.fullName}. Please try again.`);
            setSendingTo(null);
        }
    };

    return (
        <main className="matching-page">
            <div className="page-top">
                <BackLink onClick={onBack} label="Back to the support request form" />
                <span className="category-chip matching-chip">{request.category} Support</span>
            </div>

            <div className="request-support__body matching-body">
                <h1 className="visually-hidden">Volunteer Matching</h1>

                <section className="matching-filters">
                    <div>
                        <h2 className="matching-heading">Filter Skills</h2>

                        <label className="visually-hidden" htmlFor="skill-filter">Skill</label>
                        <input
                            id="skill-filter"
                            className="matching-filters__skill"
                            type="search"
                            placeholder="Skill"
                            autoComplete="off"
                            value={filters.skill}
                            onChange={(event) => setFilters({ skill: event.target.value })}
                        />
                    </div>

                    {/* Chosen in the form, so they can't be changed here (use Back) */}
                    <div>
                        <h2 className="matching-heading">Preferred Dates &amp; Times</h2>
                        {slotDates.length > 1 ? (
                            <details ref={timesRef} className="request-times">
                                <summary className="request-box">
                                    <Calendar aria-hidden="true" />
                                    {formatSlot(firstSlot)}
                                    <span className="request-times__more">+{slotDates.length - 1}</span>
                                    <ChevronDown className="request-times__arrow" aria-hidden="true" />
                                </summary>
                                <ul className="request-times__list">
                                    {slotDates.map((date) => (
                                        <li key={date.getTime()}>
                                            <Calendar aria-hidden="true" />
                                            {formatSlot(date)}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        ) : (
                            <p className="request-box">
                                <Calendar aria-hidden="true" />
                                {firstSlot && formatSlot(firstSlot)}
                            </p>
                        )}
                    </div>

                    <div>
                        <h2 className="matching-heading">Support Mode</h2>
                        <p className="request-box request-mode">{request.supportMode}</p>
                    </div>
                </section>

                <section className="matching-results" aria-labelledby="results-heading" aria-busy={status === 'loading'}>
                    {(status !== 'ready' || matches.length > 0) && (
                        <h2 id="results-heading" className="matching-heading matching-heading--results">
                            Matching Volunteers
                            {status === 'ready' && <span className="visually-hidden"> ({matches.length} found)</span>}
                        </h2>
                    )}

                    {status === 'loading' && (
                        <p className="matching-results__status" role="status">Finding volunteers...</p>
                    )}

                    {status === 'error' && (
                        <div className="matching-results__error" role="alert">
                            <p>We couldn't load volunteers. Please check your connection and try again.</p>
                            <Button size="sm" onClick={retryLoading}>Try again</Button>
                        </div>
                    )}

                    {sendError && <p className="matching-results__error" role="alert">{sendError}</p>}

                    {status === 'ready' && matches.length === 0 && (
                        <div className="no-matches">
                            <h2 id="results-heading" className="visually-hidden">Matching Volunteers (0 found)</h2>
                            <img className="no-matches__image" src={sadCat} alt="" />
                            <p className="no-matches__title">No volunteers match your filters</p>
                            <p className="no-matches__text">Please try again.</p>
                            <Button shape="pill" className="no-matches__button" onClick={onBack}>
                                Reset filters
                            </Button>
                        </div>
                    )}

                    {status === 'ready' && matches.length > 0 && (
                        <ul className="matching-results__list">
                            {matches.map((volunteer) => (
                                <li key={volunteer.volunteerId}>
                                    <VolunteerCard
                                        volunteer={volunteer}
                                        isSending={sendingTo === volunteer.volunteerId}
                                        disabled={sendingTo !== null}
                                        onViewDetails={setDetailsVolunteer}
                                        onSelect={sendRequest}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {detailsVolunteer && (
                <VolunteerDetailsModal volunteer={detailsVolunteer} onClose={() => setDetailsVolunteer(null)} />
            )}
        </main>
    );
}
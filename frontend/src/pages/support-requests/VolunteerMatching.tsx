import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import VolunteerCard from '../../components/VolunteerCard';
import VolunteerDetailsModal from '../../components/VolunteerDetailsModal';
import { type DayName, type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, formatDayAndDate, formatTime12h, getDayName, WEEK_DAYS } from '../../utils/dateTime';
import { SUPPORT_MODES } from './constants';
import DayMultiSelect from './DayMultiSelect';
import { filterVolunteers } from './filterVolunteers';
import SendRequestDialog from './SendRequestDialog';
import { fetchVolunteerProfiles } from './supportRequestApi';
import { type ValidSupportRequestDraft, type VolunteerFilters } from './types';
import './VolunteerMatching.css';

interface VolunteerMatchingProps {
    request: ValidSupportRequestDraft;
    currentUserId: string | null;
    onBack: () => void;
    onRequestSent: (volunteer: VolunteerProfile, sentAt: Date) => void;
}

type LoadStatus = 'loading' | 'error' | 'ready';

// Days of the week from the form dates
const getPreferredDays = (request: ValidSupportRequestDraft): DayName[] => {
    const days = request.proposedTimeSlots
        .map((slot) => combineDateAndTime(slot.date, slot.time))
        .filter((date): date is Date => date !== null)
        .map(getDayName);
    return WEEK_DAYS.filter((day) => days.includes(day));
};

// "Tue 20 Oct, 1:00 PM · Thu 22 Oct, 3:00 PM"
const describePreferredTimes = (request: ValidSupportRequestDraft): string =>
    request.proposedTimeSlots
        .map((slot) => {
            const dateTime = combineDateAndTime(slot.date, slot.time);
            return dateTime ? `${formatDayAndDate(dateTime)}, ${formatTime12h(slot.time)}` : '';
        })
        .filter(Boolean)
        .join(' · ');

const haveSameDays = (a: DayName[], b: DayName[]): boolean =>
    a.length === b.length && a.every((day) => b.includes(day));

function NoMatchesIllustration() {
    return (
        <svg className="no-matches__icon" viewBox="0 0 96 96" width="96" height="96" aria-hidden="true">
            <circle cx="42" cy="42" r="26" fill="#ffffff" stroke="#52d5ff" strokeWidth="6" />
            <path d="M61 61l20 20" stroke="#37cc96" strokeWidth="8" strokeLinecap="round" />
            <path d="M33 33l18 18M51 33L33 51" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" />
        </svg>
    );
}

// Volunteers matching page (Figure 21, 23)
export default function VolunteerMatching({ request, currentUserId, onBack, onRequestSent }: VolunteerMatchingProps) {
    const defaultFilters: VolunteerFilters = { skill: '', days: [], mode: request.supportMode };

    const [filters, setFilters] = useState<VolunteerFilters>(defaultFilters);
    const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadCount, setReloadCount] = useState(0);
    const [detailsVolunteer, setDetailsVolunteer] = useState<VolunteerProfile | null>(null);
    const [chosenVolunteer, setChosenVolunteer] = useState<VolunteerProfile | null>(null);

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

    const matches = filterVolunteers(volunteers, request.category, filters, currentUserId);
    const preferredDays = getPreferredDays(request);
    const filtersChanged =
        filters.skill.trim() !== '' || filters.days.length > 0 || filters.mode !== request.supportMode;

    const updateFilters = (changes: Partial<VolunteerFilters>) => setFilters((current) => ({ ...current, ...changes }));

    const retryLoading = () => {
        setStatus('loading');
        setReloadCount((count) => count + 1);
    };

    const chooseVolunteer = (volunteer: VolunteerProfile) => {
        setDetailsVolunteer(null); // Close details popup
        setChosenVolunteer(volunteer);
    };

    return (
        <>
            <PageHeader
                title="Volunteers Matching"
                breadcrumb={['Request a Support', 'Volunteers Matching']}
                onBack={onBack}
                backLabel="Back to the support request form"
            />

            <main className="request-support__body request-support__body--wide">
                {/* Filters */}
                <section className="matching-filters" aria-labelledby="filter-heading">
                    <div className="matching-filters__header">
                        <h2 id="filter-heading" className="matching-heading">Filter Volunteers</h2>
                        <span className="category-chip">{request.category} Support</span>
                        {filtersChanged && (
                            <button
                                type="button"
                                className="link-button matching-filters__reset"
                                onClick={() => setFilters(defaultFilters)}
                            >
                                Reset filters
                            </button>
                        )}
                    </div>

                    <div className="matching-filters__controls">
                        <label className="visually-hidden" htmlFor="skill-filter">Skill</label>
                        <input
                            id="skill-filter"
                            className="matching-filters__skill"
                            type="search"
                            placeholder="Skill"
                            autoComplete="off"
                            value={filters.skill}
                            onChange={(event) => updateFilters({ skill: event.target.value })}
                        />

                        <DayMultiSelect selectedDays={filters.days} onChange={(days) => updateFilters({ days })} />

                        <span className="matching-filters__divider" aria-hidden="true" />

                        <fieldset className="mode-toggle">
                            <legend className="visually-hidden">Support mode</legend>
                            {SUPPORT_MODES.map((mode) => (
                                <label key={mode} className="mode-toggle__option">
                                    <input
                                        className="mode-toggle__input"
                                        type="radio"
                                        name="mode-filter"
                                        value={mode}
                                        checked={filters.mode === mode}
                                        onChange={() => updateFilters({ mode })}
                                    />
                                    <span className="mode-toggle__label">{mode}</span>
                                </label>
                            ))}
                        </fieldset>
                    </div>

                    {preferredDays.length > 0 && (
                        <p className="matching-filters__hint">
                            <span>Your preferred times: {describePreferredTimes(request)}</span>
                            {!haveSameDays(filters.days, preferredDays) && (
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={() => updateFilters({ days: preferredDays })}
                                >
                                    Show volunteers free on these days
                                </button>
                            )}
                        </p>
                    )}
                </section>

                {/* Results */}
                <section aria-labelledby="results-heading" aria-busy={status === 'loading'}>
                    <h2 id="results-heading" className="matching-heading">
                        Matching Volunteers{status === 'ready' ? ` (${matches.length})` : ''}
                    </h2>

                    {status === 'loading' && (
                        <p className="matching-results__status" role="status">Finding volunteers...</p>
                    )}

                    {status === 'error' && (
                        <div className="matching-results__error" role="alert">
                            <p>We couldn't load volunteers. Please check your connection and try again.</p>
                            <Button size="sm" onClick={retryLoading}>Try again</Button>
                        </div>
                    )}

                    {status === 'ready' && matches.length === 0 && (
                        <div className="no-matches">
                            <NoMatchesIllustration />
                            <p className="no-matches__title">No volunteers match your filters</p>
                            {filtersChanged ? (
                                <>
                                    <p className="no-matches__text">Try a different skill, day or support mode.</p>
                                    <Button onClick={() => setFilters(defaultFilters)}>Reset filters</Button>
                                </>
                            ) : (
                                <>
                                    <p className="no-matches__text">
                                        No {request.supportMode.toLowerCase()} volunteers offer {request.category} support yet.
                                        Try the other support mode or edit your request.
                                    </p>
                                    <Button variant="outline" onClick={onBack}>Edit request</Button>
                                </>
                            )}
                        </div>
                    )}

                    {status === 'ready' && matches.length > 0 && (
                        <ul className="matching-results__list">
                            {matches.map((volunteer) => (
                                <li key={volunteer.volunteerId}>
                                    <VolunteerCard
                                        volunteer={volunteer}
                                        onViewDetails={setDetailsVolunteer}
                                        onSelect={chooseVolunteer}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            {detailsVolunteer && (
                <VolunteerDetailsModal
                    volunteer={detailsVolunteer}
                    onClose={() => setDetailsVolunteer(null)}
                    onSelect={chooseVolunteer}
                />
            )}

            {chosenVolunteer && (
                <SendRequestDialog
                    request={request}
                    volunteer={chosenVolunteer}
                    onCancel={() => setChosenVolunteer(null)}
                    onSent={(sentAt) => onRequestSent(chosenVolunteer, sentAt)}
                />
            )}
        </>
    );
}

import { useEffect, useState } from 'react';
import sadCat from '../../assets/sadcat.png';
import BackLink from '../../components/BackLink';
import Button from '../../components/Button';
import VolunteerCard from '../../components/VolunteerCard';
import VolunteerDetailsModal from '../../components/VolunteerDetailsModal';
import { type VolunteerProfile } from '../../types/volunteerProfile';
import { SUPPORT_MODES } from './constants';
import DateRangeSelect from './DateRangeSelect';
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

// Volunteer matching page (Figma: Volunteer Filtering & Matching, No Results)
export default function VolunteerMatching({ request, currentUserId, onBack, onRequestSent }: VolunteerMatchingProps) {
    const defaultFilters: VolunteerFilters = { skill: '', from: '', to: '', mode: request.supportMode };

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

    const updateFilters = (changes: Partial<VolunteerFilters>) => setFilters((current) => ({ ...current, ...changes }));

    const retryLoading = () => {
        setStatus('loading');
        setReloadCount((count) => count + 1);
    };

    return (
        <main>
            <div className="page-top">
                <BackLink onClick={onBack} label="Back to the support request form" />
                <span className="category-chip matching-chip">{request.category} Support</span>
            </div>

            <div className="request-support__body matching-body">
                <h1 className="visually-hidden">Volunteer Matching</h1>

                {/* Filters */}
                <section className="matching-filters" aria-labelledby="filter-heading">
                    <h2 id="filter-heading" className="matching-heading">Filter Volunteers</h2>

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

                        <DateRangeSelect from={filters.from} to={filters.to} onChange={updateFilters} />

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
                </section>

                {/* Results */}
                <section aria-labelledby="results-heading" aria-busy={status === 'loading'}>
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

                    {status === 'ready' && matches.length === 0 && (
                        <div className="no-matches">
                            <h2 id="results-heading" className="visually-hidden">Matching Volunteers (0 found)</h2>
                            <img className="no-matches__image" src={sadCat} alt="" />
                            <p className="no-matches__title">No volunteers match your filters</p>
                            <p className="no-matches__text">Please try again.</p>
                            <Button shape="pill" className="no-matches__button" onClick={() => setFilters(defaultFilters)}>
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
                                        onViewDetails={setDetailsVolunteer}
                                        onSelect={setChosenVolunteer}
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

            {chosenVolunteer && (
                <SendRequestDialog
                    request={request}
                    volunteer={chosenVolunteer}
                    onCancel={() => setChosenVolunteer(null)}
                    onSent={(sentAt) => onRequestSent(chosenVolunteer, sentAt)}
                />
            )}
        </main>
    );
}

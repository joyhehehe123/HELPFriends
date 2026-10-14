import { useState, useEffect } from 'react';
import { getCurrentUid } from '../../services/authService';
import { getSupportSessionsByStudentAndStatus } from '../../services/supportSessionService';
import type { SessionStatus, Role } from '../../types/constants';
import SessionList from './session-list';
import './support-sessions.css';

type Props = { status: SessionStatus };

function SupportSessions({ status }: Props) {
    const [activeTab, setActiveTab] = useState<Role>('Seeker');
    const [seekerSessionsCount, setSeekerSessionsCount] = useState<number>(0);
    const [volunteerSessionsCount, setVolunteerSessionsCount] = useState<number>(0);

    useEffect(() => {
        const uid = 'q6ueIqs7iuSpi3s0BIjuAuHN5652'; // getCurrentUid();
        // const uid = 'AijequVCA7avM7PH0zaaEoKyquj1'; // getCurrentUid();
        const fetchSessions = async () => {
            try {
                const ssCount = (await getSupportSessionsByStudentAndStatus(uid, false, status)).length;
                const vsCount = (await getSupportSessionsByStudentAndStatus(uid, true, status)).length;

                setSeekerSessionsCount(ssCount);
                setVolunteerSessionsCount(vsCount);
            } catch (error) {
                console.log(error);
            }
        }
        fetchSessions();
    }, [status])

    return (
        <section className='content'>
            <div className='header'>
                <h1>{status.toUpperCase()} SESSIONS</h1>
                <div className='tabs'>
                    <button className={activeTab === 'Seeker' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('Seeker')}>
                        As a Support Seeker ({seekerSessionsCount})
                    </button>
                    <button className={activeTab === 'Volunteer' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('Volunteer')}>
                        As a Volunteer ({volunteerSessionsCount})
                    </button>
                </div>
            </div>

            <SessionList role={activeTab} status={status}/>
        </section>
    );
}

export default SupportSessions;
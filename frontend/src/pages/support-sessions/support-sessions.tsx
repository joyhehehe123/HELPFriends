import { useState } from 'react';
import type { SessionStatus, Role } from '../../types/constants';
import './support-sessions.css';
import SessionList from '../../components/sessions/session-list';

type Props = { status: SessionStatus };

function SupportSessions({ status }: Props) {
    const [activeTab, setActiveTab] = useState<Role>('Seeker');

    return (
        <section className='content'>
            <div className='header'>
                <p>{status.toUpperCase()} SESSIONS</p>
                <div className='tabs'>
                    <button className={activeTab === 'Seeker' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('Seeker')}>
                        As a Support Seeker (6)
                    </button>
                    <button className={activeTab === 'Volunteer' ? 'active-tab' : 'tab'} onClick={() => setActiveTab('Volunteer')}>
                        As a Volunteer (7)
                    </button>
                </div>
            </div>

            <SessionList role={activeTab} status={status}/>
        </section>
    );
}

export default SupportSessions;
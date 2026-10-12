import { useState, useEffect } from 'react';
import type { SupportSession } from "../../types/supportSession";
import type { Role } from "../../types/constants";
import { getUser } from '../../services/userService';
import Button from '../../components/Button';
import './session-card.css'
import { Clock } from 'lucide-react';

type Props = { session: SupportSession, role: Role };

function SessionCards({ session, role }: Props) {
    const [participantName, setParticipantName] = useState<string>();
    const [date, setDate] = useState<string>();
    const [day, setDay] = useState<string>();
    const [time, setTime] = useState<string>();

    useEffect(() => {  
        try {
            const sessionDate = session.dateTime.toDate();
            const datePart = sessionDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const weekday = sessionDate.toLocaleDateString('en-US', {weekday: 'short'});
            const timePart = sessionDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
            setDate(datePart);
            setDay(weekday);
            setTime(timePart);

        } catch (error) {
            console.log(error);
        }

        try {
            const fetch = async () => {
                const user = role === 'Volunteer'
                    ? await getUser(session.seekerId)
                    : await getUser(session.volunteerId);
                
                setParticipantName(user?.fullName);
            }
            fetch();
        } catch (error) {
            console.log(error);
        }
    })

    return (
        <div className='session-card'>
            <div className='card-brief-details'>
                <div className='card-chips'>
                    <p className='support-category'>{(session.category).toUpperCase()} SUPPORT</p>
                    <div className='status-msg'>
                        <Clock /><p>Started 3 hours ago</p>
                    </div>
                </div>
                <div className='session-brief-details'>
                    <h4>{session.title}</h4>
                    <p>{date} ({day}) {time}, {session.duration} minutes</p>
                    <p>{role === 'Seeker' ? 'Volunteer: ' + participantName : 'Support Seeker: ' + participantName}</p>
                    <p>Mode: {session.supportMode}</p>
                </div>
            </div>
            <div className='card-buttons'>
                <Button size='sm' className='card-button'>View Details</Button>
                <Button size='sm' className='card-button'>Mark As Completed</Button>
            </div>
        </div>
    );
}

export default SessionCards;
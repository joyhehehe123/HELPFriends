import { Link } from 'react-router-dom';
import './my-support-sessions.css';
import happyCat from '../../assets/happycat.png';
import goodCat from '../../assets/goodcat.png';
import sadCat from '../../assets/sadcat.png';

function SupportSessions() {
   return (
      <section id='content'>
         <div className='wrapper'>
            <Link to='/support-sessions/active' className='card link' id='active-sessions'>
               <div className='title-subtitle'>
                  <p className='status-title'>ACTIVE SESSIONS</p>
                  <p className='subtitle'>
                     As a Support Seeker /<br/>
                     As a Volunteer
                  </p>
               </div>
               <img src={happyCat} />
            </Link>
            <Link to='/support-sessions/completed' className='card link' id='completed-sessions'>
               <div className='title-subtitle'>
                  <p className='status-title'>COMPLETED SESSIONS</p>
                  <p className='subtitle'>
                     As a Support Seeker /<br/>
                     As a Volunteer
                  </p>
               </div>
               <img src={goodCat} />
            </Link>
            <Link to='/support-sessions/cancelled' className='card link' id='cancelled-sessions'>
               <div className='title-subtitle'>
                  <p className='status-title'>CANCELLED SESSIONS</p>
                  <p className='subtitle'>
                     As a Support Seeker /<br/>
                     As a Volunteer
                  </p>
               </div>
               <img src={sadCat} />
            </Link>
         </div>
      </section>
   )
}

export default SupportSessions;
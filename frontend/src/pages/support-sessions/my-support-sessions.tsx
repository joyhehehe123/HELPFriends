import { Link } from 'react-router-dom';
import './my-support-session.css';
import happyCat from '../../assets/happycat.png';
import goodCat from '../../assets/goodcat.png';
import sadCat from '../../assets/sadcat.png';

function MySupportSessions() {
   return (
      <section className='content'>
         <div className='wrapper'>
            <Link to='' className='card link' id='active-sessions'>
               <div className='title-subtitle'>
                  <p className='title'>ACTIVE SESSIONS</p>
                  <p className='subtitle'>
                     As a Support Seeker /<br/>
                     As a Volunteer
                  </p>
               </div>
               <img src={happyCat} />
            </Link>
            <Link to='' className='card link' id='completed-sessions'>
               <div className='title-subtitle'>
                  <p className='title'>COMPLETED SESSIONS</p>
                  <p className='subtitle'>
                     As a Support Seeker /<br/>
                     As a Volunteer
                  </p>
               </div>
               <img src={goodCat} />
            </Link>
            <Link to='' className='card link' id='cancelled-sessions'>
               <div className='title-subtitle'>
                  <p className='title'>CANCELLED SESSIONS</p>
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

export default MySupportSessions;
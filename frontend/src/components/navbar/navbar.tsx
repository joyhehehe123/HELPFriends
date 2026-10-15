import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import profilePic from '../../assets/mrballs.jpg';
import './navbar.css';

function Navbar() {
    return (
        <nav className='navbar'>
            <Link to='' className='logo link'>
                <span id='logo-help'>HELP</span>
                <span id='logo-friends'>Friends</span>
            </Link>
            <div id='nav-links'>
                <Link to='/request-support' className='nav-link link'><p className='nav-text'>Request a Support</p></Link>
                <Link to='/support-requests' className='nav-link link'><p className='nav-text'>My Support Requests</p></Link>
                <Link to='/support-sessions' className='nav-link link'><p className='nav-text'>My Support Sessions</p></Link>
            </div>
            <div id='bell-and-profile'>
                <Link to='/notifications' id='bell' className='bell link'><Bell /></Link>

                <Link to='' id='profile' className='link'><img src={profilePic} /></Link>
            </div>
        </nav>
    )
}

export default Navbar;
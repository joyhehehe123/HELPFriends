import { ChevronLeft } from 'lucide-react';
import './back-button.css';

function BackButton() {
    return (
        <button className="back-button">
            <ChevronLeft />
            <p>Back</p>
        </button>
    )
}

export default BackButton;
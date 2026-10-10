import '../../Signup/SignupSteps/signup.css';

const mascotImage = new URL('../../../assets/Cat_thumbs.png', import.meta.url).href;

interface ConfirmationProps {
    onLogin: () => void;
}

export default function createConfirmationStep({ onLogin }: ConfirmationProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-confirmation';
    container.innerHTML = `
        <img class="confirmation-mascot" src="${mascotImage}" alt="Happy cat giving a thumbs up" />
        <h2>Congratulations!</h2>
        <p>You have successfully reset your password.<br />You can now login to HELPFriends.</p>
        <div class="signup-actions">
            <button type="button" class="signup-button">Login</button>
        </div>
    `;

    container.querySelector<HTMLButtonElement>('.signup-button')!.addEventListener('click', () => {
        onLogin();
    });

    return container;
}
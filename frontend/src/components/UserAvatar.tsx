import './UserAvatar.css';

interface UserAvatarProps {
    name: string;
    photoUrl?: string; // Shows initials if empty
    size?: 'md' | 'lg';
}

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

// alt="" because the name is shown next to it
export default function UserAvatar({ name, photoUrl, size = 'md' }: UserAvatarProps) {
    if (photoUrl) {
        return <img className={`user-avatar user-avatar--${size}`} src={photoUrl} alt="" />;
    }
    return (
        <span className={`user-avatar user-avatar--${size} user-avatar--initials`} aria-hidden="true">
            {getInitials(name)}
        </span>
    );
}

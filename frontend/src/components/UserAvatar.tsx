import './UserAvatar.css';

interface UserAvatarProps {
    name: string;
    photoUrl?: string | null; // Shows initials if empty
    size?: 'sm' | 'md' | 'lg' | 'xl'; // 48, 64, 76, 96 px
}

const getInitials = (name: string): string =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');

export default function UserAvatar({ name, photoUrl, size = 'lg' }: UserAvatarProps) {
    if (photoUrl) {
        return <img className={`user-avatar user-avatar--${size}`} src={photoUrl} alt="" />;
    }
    return (
        <span className={`user-avatar user-avatar--${size} user-avatar--initials`} aria-hidden="true">
            {getInitials(name)}
        </span>
    );
}

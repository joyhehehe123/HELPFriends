import { type ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    size?: 'md' | 'sm';
    shape?: 'rounded' | 'pill';
    fullWidth?: boolean;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    shape = 'rounded',
    fullWidth = false,
    type = 'button', // Avoid submitting forms by accident
    className = '',
    ...props
}: ButtonProps) {
    const classes = [
        'hf-button',
        `hf-button--${variant}`,
        `hf-button--${size}`,
        shape === 'pill' ? 'hf-button--pill' : '',
        fullWidth ? 'hf-button--full' : '',
        className,
    ].filter(Boolean).join(' ');

    return <button type={type} className={classes} {...props} />;
}

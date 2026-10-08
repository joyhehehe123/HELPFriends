import { type ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline';
    size?: 'md' | 'sm';
    fullWidth?: boolean;
}

// App-wide button
export default function Button({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    type = 'button',
    className = '',
    ...props
}: ButtonProps) {
    const classes = [
        'hf-button',
        `hf-button--${variant}`,
        `hf-button--${size}`,
        fullWidth ? 'hf-button--full' : '',
        className,
    ].filter(Boolean).join(' ');

    return <button type={type} className={classes} {...props} />;
}

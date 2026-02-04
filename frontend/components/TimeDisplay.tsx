import React from 'react';

interface TimeDisplayProps {
    date: string | Date;
}

export default function TimeDisplay({ date }: TimeDisplayProps) {
    const dateObj = new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    let relativeTime = '';

    if (diffInSeconds < 60) {
        relativeTime = `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
        const mins = Math.floor(diffInSeconds / 60);
        relativeTime = `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        relativeTime = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
    }

    // Fallback for just created or future/weird times
    if (diffInSeconds < 5) {
        relativeTime = 'Just now';
    }

    return (
        <span title={dateObj.toLocaleString()} style={{ cursor: 'default' }}>
            {relativeTime}
        </span>
    );
}

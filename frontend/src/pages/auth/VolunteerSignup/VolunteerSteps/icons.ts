const svg = (inner: string, size = 24): string =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;

export const icons = {
    cap: svg('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/><path d="M22 9v6"/>'),
    monitor: svg('<rect x="3" y="4" width="18" height="12" rx="3"/><path d="M12 16v4M8 20h8"/>'),
    userPlus: svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20v-1a6 6 0 0 1 12 0v1z"/><path d="M19 6v6M16 9h6"/>'),
    sparkles: svg('<path d="M14 8l1.8 4.2L20 14l-4.2 1.8L14 20l-1.8-4.2L8 14l4.2-1.8z"/><path d="M6 3l1 2.2L9.2 6.2 7 7.2 6 9.4 5 7.2 2.8 6.2 5 5.2z"/>'),
    building: svg('<rect x="2" y="9" width="8" height="11" rx="1.5"/><rect x="10" y="4" width="12" height="16" rx="1.5"/><path d="M5 13v.01M5 16v.01M14 8v.01M18 8v.01M14 12v.01M18 12v.01"/><path d="M14 20v-3.5a2 2 0 0 1 4 0V20"/>'),
    plusCircle: svg('<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>', 22),
    close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 18),
    copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>', 22),
};
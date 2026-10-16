const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

function formatDistance(totalMinutes: number): string {
    const mins = Math.abs(totalMinutes);
    if (mins < 60) return plural(mins, "minute");
    if (mins < 1440) return plural(Math.floor(mins / 60), "hour");
    return plural(Math.floor(mins / 1440), "day");
}

function getStatusMessage(diffMin: number): string {
    if (diffMin === 0) return "Starting now";
    return diffMin < 0
        ? `Started ${formatDistance(diffMin)} ago`
        : `Starting in ${formatDistance(diffMin)}`;
}

export default getStatusMessage;
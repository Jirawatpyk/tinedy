import { StaffUnavailability } from '../types';

// Simple RRULE parser for FREQ=DAILY|WEEKLY and UNTIL
function parseRRule(rrule: string): { freq: 'DAILY' | 'WEEKLY', until?: Date, byday?: string } {
    const parts = rrule.split(';');
    const rule: any = {};
    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key === 'FREQ') rule.freq = value;
        if (key === 'UNTIL') {
            const dateStr = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(9, 11)}:${value.slice(11, 13)}:${value.slice(13, 15)}Z`;
            rule.until = new Date(dateStr);
        }
        if (key === 'BYDAY') rule.byday = value;
    });
    return rule;
}


export function expandRRule(
    item: StaffUnavailability,
    viewStartDate: Date, // Start of the month/view
    viewEndDate: Date   // End of the month/view
): StaffUnavailability[] {
    // If it's not a recurring event, just check if the single instance is within the view
    if (!item.recurrenceRule) {
        const singleEventDate = new Date(item.startTime);
        if (singleEventDate >= viewStartDate && singleEventDate <= viewEndDate) {
            return [item];
        }
        return [];
    }

    const occurrences: StaffUnavailability[] = [];
    const rule = parseRRule(item.recurrenceRule);
    const seriesStartDate = new Date(item.startTime);
    const seriesEndDate = new Date(item.endTime);

    // If series starts after our view ends, there's nothing to do
    if (seriesStartDate > viewEndDate) return [];

    const duration = seriesEndDate.getTime() - seriesStartDate.getTime();
    
    // The loop should not go past the view's end or the rule's UNTIL date
    const loopEndDate = rule.until && rule.until < viewEndDate ? rule.until : viewEndDate;

    // Start iterating from the beginning of our view window
    let cursor = new Date(viewStartDate);

    while (cursor <= loopEndDate) {
        // But only generate occurrences on or after the series actually starts
        if (cursor < seriesStartDate) {
            cursor.setDate(cursor.getDate() + 1);
            continue;
        }

        let isMatch = false;
        if (rule.freq === 'DAILY') {
            isMatch = true;
        } else if (rule.freq === 'WEEKLY') {
            const dayOfWeek = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][cursor.getDay()];
            if (dayOfWeek === rule.byday) {
                isMatch = true;
            }
        }

        if (isMatch) {
            const occurrenceStart = new Date(cursor);
            occurrenceStart.setHours(seriesStartDate.getHours(), seriesStartDate.getMinutes(), seriesStartDate.getSeconds(), seriesStartDate.getMilliseconds());
            
            const occurrenceEnd = new Date(occurrenceStart.getTime() + duration);
            
            occurrences.push({
                ...item, // Keep parent ID, reason, etc.
                startTime: occurrenceStart.toISOString(),
                endTime: occurrenceEnd.toISOString(),
            });
        }
        
        cursor.setDate(cursor.getDate() + 1);
    }
    
    return occurrences;
}

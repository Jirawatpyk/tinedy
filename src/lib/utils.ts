/**
 * Formats a date string into a more readable format.
 * @param dateString The ISO date string (e.g., "2023-10-27") or a Date object.
 * @param options Intl.DateTimeFormatOptions to customize the output.
 * @param locale The locale to use for formatting (e.g., 'en-US', 'th-TH').
 * @returns A formatted date string, or 'N/A' if the date is invalid.
 */
export const formatDate = (
  dateString?: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale: string = 'en-US'
): string => {
  if (!dateString) return 'N/A';
  try {
    let date: Date;
    if (dateString instanceof Date) {
      date = dateString;
    } else {
      // If it's a string, check if it's a full timestamp or just a date.
      if (dateString.includes('T')) {
        date = new Date(dateString); // Parse full ISO string directly
      } else {
        // The 'T00:00:00' is important to ensure the date is parsed in the local time zone
        // and not shifted due to UTC conversion, which can change the day.
        date = new Date(`${dateString}T00:00:00`); // Append time for date-only strings
      }
    }
    
    // Check for invalid date after parsing
    if (isNaN(date.getTime())) {
      // Throw an error to be caught by the catch block, which logs the original input
      throw new Error(`Parsed to invalid date from input: ${dateString}`);
    }

    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error("Invalid date string provided to formatDate:", dateString);
    return 'Invalid Date';
  }
};

/**
 * Formats a time string (e.g., "14:30") into a 12-hour format with AM/PM.
 * @param timeString The time string in HH:mm format.
 * @param options Intl.DateTimeFormatOptions to customize the output.
 * @param locale The locale to use for formatting.
 * @returns A formatted time string (e.g., "2:30 PM").
 */
export const formatTime = (
  timeString: string,
  options?: Intl.DateTimeFormatOptions,
  locale: string = 'en-US'
): string => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };

  if (locale === 'en-US') {
      (defaultOptions as any).hour12 = true;
  } else {
      (defaultOptions as any).hour12 = false;
  }

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
};

/**
 * Calculates the end time based on a start time and duration in minutes.
 * @param startTime The start time string in HH:mm format.
 * @param duration The duration in minutes.
 * @param locale The locale to use for formatting.
 * @returns The calculated end time in 12-hour format with AM/PM.
 */
export const calculateEndTime = (startTime: string, duration: number, locale: string = 'en-US'): string => {
  if (!startTime || !duration) return '';
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);

  const endDate = new Date(startDate.getTime() + duration * 60000);

  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  
  if (locale === 'en-US') {
      (options as any).hour12 = true;
  } else {
      (options as any).hour12 = false;
  }


  return new Intl.DateTimeFormat(locale, options).format(endDate);
};

/**
 * Formats an ISO date string into a relative time string (e.g., "2 hours ago").
 * @param isoString The date in ISO 8601 format.
 * @returns A relative time string.
 */
export const formatDistanceToNow = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 5) {
        return "just now";
    } else if (minutes < 1) {
        return `${seconds} seconds ago`;
    } else if (minutes < 60) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(date.toISOString().split('T')[0]);
    }
};
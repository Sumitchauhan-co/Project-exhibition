/**
 * Formats an ISO date string or Date object into a readable string (e.g., "Jan 15, 2024").
 *
 * @param dateInput - The date string or Date object to format.
 * @returns Formatted date string or null if the date is invalid or missing.
 */
export const formatMemberSinceDate = (
	dateInput?: string | Date | null,
): string | null => {
	if (!dateInput) return null;

	const date = new Date(dateInput);

	// Check if date is valid
	if (isNaN(date.getTime())) {
		return null;
	}

	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
};

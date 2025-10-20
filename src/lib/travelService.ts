/**
 * Simulates fetching travel time between two locations.
 * In a real application, this would call a mapping service API like Google Maps.
 * @param origin The starting address.
 * @param destination The destination address.
 * @returns A promise that resolves to the travel time in minutes.
 */
export const getTravelTime = async (origin: string, destination: string): Promise<number> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 50));

  // Return a random travel time between 15 and 90 minutes for demonstration
  return Math.floor(Math.random() * 75) + 15;
};

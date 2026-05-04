/**
 * Estimates travel time between two activities in minutes.
 * This is a simplified estimation for the KPI requirement.
 */
export const estimateTravelTime = (origin?: string, destination?: string): number => {
  if (!origin || !destination) return 0;
  if (origin.toLowerCase() === destination.toLowerCase()) return 5;
  
  // Basic heuristic: 30 minutes for different locations
  // In a real app, this would use Google Maps Distance Matrix API
  return 30;
};

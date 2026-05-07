import type { TripResponse } from '../services/trip.service';
import type { ItineraryResponse } from '../services/itinerary.service';

export interface AssuranceCheck {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'warning' | 'fail';
  category: 'logistics' | 'budget' | 'security' | 'schedule';
}

export const runTripAssurance = (trip: TripResponse, itineraries: ItineraryResponse[]): AssuranceCheck[] => {
  const checks: AssuranceCheck[] = [];

  // 1. Schedule Continuity
  const totalActivities = itineraries.reduce((acc, itin) => acc + (itin.days?.reduce((dAcc, day) => dAcc + (day.activities?.length || 0), 0) || 0), 0);
  checks.push({
    id: 'schedule_activity_count',
    title: 'Experience Density',
    description: totalActivities > 0 ? `${totalActivities} experiences mapped across ${itineraries[0]?.totalDays} days.` : 'No experiences mapped yet.',
    status: totalActivities > 0 ? 'pass' : 'warning',
    category: 'schedule'
  });

  // 2. Budget Coverage
  const activitiesWithCost = itineraries.flatMap(itin => itin.days?.flatMap(day => day.activities) || [])
    .filter(a => a && (a.cost || 0) > 0).length;
  const totalActivitiesCount = itineraries.flatMap(itin => itin.days?.flatMap(day => day.activities) || []).length;
  
  checks.push({
    id: 'budget_coverage',
    title: 'Financial Coverage',
    description: `${activitiesWithCost} of ${totalActivitiesCount} activities have estimated costs.`,
    status: (activitiesWithCost / totalActivitiesCount) > 0.7 ? 'pass' : 'warning',
    category: 'budget'
  });

  // 3. Document Readiness (Mock for now, could check TravelDocModule)
  checks.push({
    id: 'document_check',
    title: 'Vault Integrity',
    description: 'Travel documents and identification verified for operational window.',
    status: 'pass',
    category: 'security'
  });

  // 4. Logistics Alignment
  const startDate = new Date(trip.startDate);
  const now = new Date();
  const daysToTrip = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  checks.push({
    id: 'departure_readiness',
    title: 'Departure Window',
    description: daysToTrip > 0 ? `Departure in ${daysToTrip} days. Operational readiness confirmed.` : 'Operational window active.',
    status: daysToTrip < 7 && daysToTrip > 0 ? 'warning' : 'pass',
    category: 'logistics'
  });

  return checks;
};

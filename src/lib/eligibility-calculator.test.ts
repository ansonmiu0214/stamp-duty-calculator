import { assert, describe, it, expect } from 'vitest';
import { calculateRefundEligibility } from './eligibility-calculator';
import type { Trip } from './triplib';

describe('eligibility-calculator test', () => {
	it('no, but possible', () => {
        const completionDate = new Date(2024, 5 - 1, 31);
        const trips: Trip[] = [
            { startDate: new Date(2023, 6 - 1, 10), endDate: new Date(2023, 8 - 1, 11) },
            { startDate: new Date(2023, 12 - 1, 1), endDate: new Date(2024, 1 - 1, 31) },
        ];

        const eligibility = calculateRefundEligibility(completionDate, trips)
		expect(eligibility.result).toBe('no, but possible!');
        
        assert(eligibility.result === "no, but possible!");
        expect(eligibility.numDaysMissing).toEqual(55);
        expect(eligibility.latestTrip).toEqual(trips[trips.length - 1]);
	});
});

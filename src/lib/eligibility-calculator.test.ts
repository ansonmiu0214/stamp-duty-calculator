import { assert, describe, it, expect } from 'vitest';
import { optimalRefundEligibility, refundEligibilityForWindow } from './eligibility-calculator';
import type { Trip } from './triplib';


function YYYYMMDD(yyyymmdd: string) {
    const [yyyy, mm, dd] = yyyymmdd.split("/");
    return new Date(Number.parseInt(yyyy), Number.parseInt(mm) - 1, Number.parseInt(dd), 12, 0, 0, 0);
}

function makeTrip(startDate: string, endDate: string): Trip {
    return { startDate: YYYYMMDD(startDate), endDate: YYYYMMDD(endDate) };
}

describe('optimalEligibility test', () => {
	// it('no, but possible', () => {
    //     const completionDate = new Date(2024, 5 - 1, 31);
    //     const trips: Trip[] = [
    //         { startDate: new Date(2023, 6 - 1, 10), endDate: new Date(2023, 8 - 1, 11) },
    //         { startDate:; new Date(2023, 12 - 1, 1), endDate: new Date(2024, 1 - 1, 31) },
    //     ];

    //     const eligibility = calculateRefundEligibility(completionDate, trips)
	// 	expect(eligibility.result).toBe('no, but possible!');
        
    //     assert(eligibility.result === "no, but possible!");
    //     expect(eligibility.numDaysMissing).toEqual(55);
    //     expect(eligibility.latestTrip).toEqual(trips[trips.length - 1]);
	// });

    // it('partial trip', () => {
    //     const windowStartDate = new Date(2023, 8-1, 1);
    //     const windowEndDate = new Date(2024, 6-1, 30);
    //     const trips = [
    //         { startDate: new Date(2023, 6 - 1, 10), endDate: new Date(2023, 9 - 1, 11) },
    //         { startDate: new Date(2024, 1 - 1, 1), endDate: new Date(2024, 3 - 1, 31) },
    //     ]

    //     const eligibility = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
    //     console.log(eligibility);
    //     expect(eligibility.result).toBe('yes!')
    // });

    it('eligible, earliest possible window', () => {
        assert(false, "todo");
    });

    it('eligibile, latest possible window', () => {
        assert(false, "todo");
    });

    it('not eligible yet', () => {
        assert(false, "todo");
    });

    it('never eligible', () => {
        assert(false, "todo");
    });
});

describe('refundEligibilityForWindow test', () => {
    const windowStartDate = YYYYMMDD("2023/01/01");
    const windowEndDate = YYYYMMDD("2023/12/31");

    it('eligible with exactly 183 days across 1 trip', () => {
        const trips = [
            makeTrip("2023/02/14", "2023/08/15"),
        ];
        console.log(trips[0].endDate.toLocaleDateString())

        const eligiblity = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        expect(eligiblity.result).toEqual("yes, immediately!");
    });

    it('eligible across multiple trips', () => {
        const trips = [
            makeTrip("2023/02/14", "2023/04/15"),   //  61 days, all valid
            makeTrip("2023/07/10", "2023/10/31"),   // 114 days, all valid
            makeTrip("2023/11/11", "2023/12/12"),   //  32 days, all valid
        ];

        const eligiblity = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        expect(eligiblity.result).toEqual("yes, immediately!");
    });

    it('eligible with exactly 183 days across multiple trips spanning outside window', () => {
        const trips = [
            makeTrip("2022/12/01", "2023/03/02"),   //  92 days, 61 valid
            makeTrip("2023/07/10", "2023/10/31"),   // 114 days, all valid
            makeTrip("2023/12/24", "2024/01/30"),   //  38 days, 8 valid
        ];

        const eligiblity = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        expect(eligiblity.result).toEqual("yes, immediately!");
    });

    it('not eligible yet with 1 trip and exactly enough days', () => {
        const trips = [
            makeTrip("2023/07/03", "2023/09/23")    // 83 days, all valid
        ];

        const eligiblity = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        expect(eligiblity.result).toEqual("no, but possible!");

        assert(eligiblity.result === "no, but possible!");
        expect(eligiblity.numDaysMissing).toEqual(100);
        expect(eligiblity.latestTrip).toEqual(trips[0]);
    });

    it('not eligible yet with multiple trips', () => {
        assert(false, "todo");
    });

    it('not eligible yet with multiple trips spanning outside window', () => {
        assert(false, "todo");        
    });

    it('never eligible with 1 trip and one day short', () => {
        const trips = [
            makeTrip("2023/07/04", "2023/09/23")    // 82 days, all valid
        ];

        const eligiblity = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        expect(eligiblity.result).toEqual("no, impossible!");

        assert(eligiblity.result === "no, impossible!");
        expect(eligiblity.numValidDays).toEqual(82);
    });

    it('never eligible with multiple trips', () => {
        assert(false, "todo");
    });

    it('never eligible with multiple trips spanning outside window', () => {
        assert(false, "todo");
    });
});
import { computeOverlap, hasOverlap, type Trip } from "./triplib";
import * as D from "./datelib";

interface IEligible {
    "result": "yes, immediately!";
    windowStartDate: Date;
    windowEndDate: Date;
}

interface INotEligibleYet {
    "result": "no, but possible!"
    windowStartDate: Date;
    windowEndDate: Date;
    numDaysMissing: number;
    latestTrip: Trip;
}

interface INeverEligible {
    "result": "no, impossible!";
    windowStartDate: Date;
    windowEndDate: Date;
    numValidDays: number;
};

// TODO: can these functions be generated automatically?
function Eligible(args: Omit<IEligible, "result">): IEligible {
    return { "result": "yes, immediately!", ...args };
}

function NotEligibleYet(args: Omit<INotEligibleYet, "result">): INotEligibleYet {
    return { "result": "no, but possible!", ...args };
}

function NeverEligible(args: Omit<INeverEligible, "result">): INeverEligible {
    return { "result": "no, impossible!", ...args };
}

type TripExtension = Omit<INotEligibleYet, "result">
type MaxValidWindow = Omit<INeverEligible, "result">

export type Eligibility =
    | IEligible
    | INotEligibleYet
    | INeverEligible
    ;

const daysRequired = 183;

export function refundEligibilityForWindow(windowStartDate: Date, windowEndDate: Date, trips: Trip[]): Eligibility {
    const window = { startDate: windowStartDate, endDate: windowEndDate };    
    const validTrips = trips.filter(trip => hasOverlap(trip, window));
    const numValidDays = validTrips.map(trip => computeOverlap(trip, window)).reduce((x, y) => x + y, 0);
    
    if (numValidDays >= daysRequired) {
        return Eligible({ windowStartDate, windowEndDate });
    }
    
    const numDaysMissing = daysRequired - numValidDays;
    if (validTrips.length > 0 && D.daysBetween(validTrips[validTrips.length - 1].endDate, windowEndDate) >= numDaysMissing) {
        const latestValidTrip = validTrips[validTrips.length - 1];
        // possible - need to add 'numDaysMissing' between
        // 'latestValidTrip.endDate' and 'windowEndDate'.

        return NotEligibleYet({
            windowStartDate,
            windowEndDate,
            numDaysMissing,
            latestTrip: latestValidTrip
        });
    }
    else {
        return NeverEligible({
            windowStartDate,
            windowEndDate,
            numValidDays,
        });
    }
}

export function optimalRefundEligibility(completionDate: Date, trips: Trip[]): Eligibility {
    let maxValidWindow: MaxValidWindow | undefined = {"numValidDays": 0, "windowStartDate": new Date(), "windowEndDate": new Date() }
    let shortestTripExtension: TripExtension | undefined;

    const earliestWindowStartDate = D.calculateFrom(completionDate).applyDelta({ days: -364 }).equals();
    const latestWindowStartDate = D.clone(completionDate);
    
    for (const windowStartDate of D.xrange(earliestWindowStartDate, latestWindowStartDate)) {
        const windowEndDate = D.calculateFrom(windowStartDate).applyDelta({ days: 364 }).equals();

        const eligibility = refundEligibilityForWindow(windowStartDate, windowEndDate, trips);
        switch (eligibility.result) {
            case "yes, immediately!": return eligibility;
            case "no, but possible!": {
                console.log(eligibility )
                if (shortestTripExtension === undefined || eligibility.numDaysMissing <= shortestTripExtension.numDaysMissing) {
                    shortestTripExtension = eligibility;
                }
                break;
            }
            case "no, impossible!": {
                if (maxValidWindow === undefined || eligibility.numValidDays >= maxValidWindow.numValidDays) {
                    maxValidWindow = eligibility;
                }
                break;
            }
        }
    }

    if (shortestTripExtension === undefined) {
        return {
            "result": "no, impossible!",
            ...maxValidWindow!
        };
    }
    else {
        return {
            "result": "no, but possible!",
            ...shortestTripExtension
        };
    }
}
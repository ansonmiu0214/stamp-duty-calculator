import { computeOverlap, hasOverlap, type Trip } from "./triplib";
import * as D from "./datelib";

interface TripExtension {
    windowStartDate: Date,
    windowEndDate: Date,
    numDaysMissing: number,
    latestTrip: Trip,
};

interface MaxValidWindow {
    windowStartDate: Date,
    windowEndDate: Date,
    numValidDays: number,
};

export type Eligibility =
    | { "result": "yes, immediately!", windowStartDate: Date, windowEndDate: Date }
    | { "result": "no, but possible!" } & TripExtension
    | { "result": "no, impossible!" } & MaxValidWindow
    ;

const daysRequired = 180;

export function calculateRefundEligibility(completionDate: Date, trips: Trip[]): Eligibility {
    let maxValidWindow: MaxValidWindow | undefined;
    let shortestTripExtension: TripExtension | undefined;

    const earliestWindowStartDate = D.calculateFrom(completionDate).applyDelta({ days: -364 }).equals();
    const latestWindowStartDate = D.clone(completionDate);
    
    for (const windowStartDate of D.xrange(earliestWindowStartDate, latestWindowStartDate)) {
        const windowEndDate = D.calculateFrom(windowStartDate).applyDelta({ days: 364 }).equals();
        const window = { startDate: windowStartDate, endDate: windowEndDate };

        const validTrips = trips.filter(trip => hasOverlap(trip, window));
        const numValidDays = validTrips.map(trip => computeOverlap(trip, window)).reduce((x, y) => x + y, 0);

        if (numValidDays >= daysRequired) {
            return {
                "result": "yes, immediately!",
                windowStartDate,
                windowEndDate,
            };
        }

        const numDaysMissing = daysRequired - numValidDays;
        if (validTrips.length > 0 && D.daysBetween(validTrips[validTrips.length - 1].endDate, windowEndDate) >= numDaysMissing) {
            const latestValidTrip = validTrips[validTrips.length - 1];
            // possible - need to add 'numDaysMissing' between
            // 'latestValidTrip.endDate' and 'windowEndDate'.

            if (shortestTripExtension === undefined || numDaysMissing < shortestTripExtension.numDaysMissing) {
                shortestTripExtension = {
                    windowStartDate,
                    windowEndDate,
                    numDaysMissing,
                    latestTrip: latestValidTrip
                };
            }
        }
        else {
            if (maxValidWindow === undefined || numValidDays >= maxValidWindow.numValidDays) {
                maxValidWindow = { windowStartDate, windowEndDate, numValidDays };
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

    // for each day in 'trips' that is '>= earliest start window'
        // determine end window = start + 364 days
        // find how many valid days
        // maxWindow <-- max(maxWindow, numValidDays)
        // if numValidDays >= MIN_RQMT:
            // return 'yes, immediately!', { start, end }, numValidDays
        // else:
            // numMissing = MIN_RQMT - numValidDays
            // if endWindow - lastTrip >= numMissing:
                // store := 'no, but possible!', { start, end }, numMissing, lastTrip

    // if store:
        // return option with smallest 'numMissing' value

    // else:
        // return 'impossible', maxWindows
}
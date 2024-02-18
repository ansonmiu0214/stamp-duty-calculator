import * as D from "./datelib";

export interface Trip {
    startDate: Date,
    endDate: Date
};

export function hasOverlap(trip1: Trip, trip2: Trip): boolean {
    // ( trip1 ) ... ( trip2 )

    if (trip1.endDate < trip2.startDate) {
        return false;
    }

    // ( trip2 ) ... ( trip1 )

    if (trip2.endDate < trip1.startDate) {
        return false;
    }

    return true;
}

export function computeOverlap(trip1: Trip, trip2: Trip): number {
    if (!hasOverlap(trip1, trip2)) {
        return 0;
    }

    //  ( trip1 )
    // (    trip 2  )

    if (trip1.startDate >= trip2.startDate && trip1.endDate <= trip2.endDate) {
        return D.daysBetween(trip1.startDate, trip1.endDate);
    }

    //  ( trip2 )
    // (    trip 1  )

    if (trip2.startDate >= trip1.startDate && trip2.endDate <= trip1.endDate) {
        return D.daysBetween(trip2.startDate, trip2.endDate);
    }

    // ( trip 1)
    //      ( trip 2 )

    if (trip1.startDate < trip2.startDate) {
        return D.daysBetween(trip2.startDate, trip1.endDate);
    }

    // ( trip 2 )
    //      ( trip 1 ) 
    else {
        return D.daysBetween(trip1.startDate, trip2.endDate);
    }
}
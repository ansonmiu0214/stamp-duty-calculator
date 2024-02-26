import { areIntervalsOverlapping, getOverlappingDaysInIntervals, type Interval } from "date-fns";

export interface Trip {
    startDate: Date,
    endDate: Date
};

function asInterval(trip: Trip): Interval<Date> {
    const { startDate: start, endDate: end } = trip;
    return { start, end };
}

export function hasOverlap(trip1: Trip, trip2: Trip): boolean {
    return areIntervalsOverlapping(asInterval(trip1), asInterval(trip2), { inclusive: true });
}

export function computeOverlap(trip1: Trip, trip2: Trip): number {
    if (!hasOverlap(trip1, trip2)) {
        return 0;
    }

    return getOverlappingDaysInIntervals(asInterval(trip1), asInterval(trip2)) + 1;
}
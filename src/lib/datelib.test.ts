import { describe, expect, it } from "vitest";
import * as D from "./datelib";

describe('calculateFrom-test', () => {
    it('breathing', () => {
        const date = new Date();
        const result = D.calculateFrom(date).equals();

        expect(result).toEqual(date);
    });

    it('apply positive day delta', () => {
        const baseline = new Date(2024, 1 - 1, 31);
        const result = D.calculateFrom(baseline).applyDelta({ days: 14 }).equals();

        expect(result).toEqual(new Date(2024, 2 - 1, 14));
    });

    it('apply negative day delta', () => {
        const baseline = new Date(2024, 2 - 1, 14);
        const result = D.calculateFrom(baseline).applyDelta({ days: -14 }).equals();

        expect(result).toEqual(new Date(2024, 1 - 1, 31));
    });
});

describe('xrange-test', () => {    
    it('same startDate and endDate', () => {
        const startDate = new Date(2024, 1 - 1, 31);
        const endDate = new Date(2024, 1 - 1, 31);

        const result = [...D.xrange(startDate, endDate)];
        expect(result.length).toEqual(1);

        // TODO: move to helper function in this 'fixture'
        expect(result[0].getFullYear()).toEqual(2024);
        expect(result[0].getMonth()).toEqual(1 - 1);
        expect(result[0].getDate()).toEqual(31);
    });

    it('startDate < endDate', () => {
        const startDate = new Date(2024, 1 - 1, 31);
        const endDate = new Date(2024, 2 - 1, 3);
        const expectedDates = [
            [2024, 1 - 1, 31],
            [2024, 2 - 1, 1],
            [2024, 2 - 1, 2],
            [2024, 2 - 1, 3],
        ] as const;

        const result = [...D.xrange(startDate, endDate)];
        expect(result.length).toEqual(expectedDates.length);

        expectedDates.forEach(([year, month, day], idx) => {
            const actual = result[idx];

            expect(actual.getFullYear()).toEqual(year);
            expect(actual.getMonth()).toEqual(month);
            expect(actual.getDate()).toEqual(day);
        });
    });

    it('startDate > endDate is UB', () => {
        
    });

    it('ignores time granuality', () => {
        const startDate = new Date(2024, 1 - 1, 31, 23, 59, 59);
        const endDate = new Date(2024, 2 - 1, 1, 0, 0, 1);
        
        const expectedDates = [
            [2024, 1 - 1, 31],
            [2024, 2 - 1, 1],
        ] as const;

        const result = [...D.xrange(startDate, endDate)];
        expect(result.length).toEqual(expectedDates.length);

        expectedDates.forEach(([year, month, day], idx) => {
            const actual = result[idx];

            expect(actual.getFullYear()).toEqual(year);
            expect(actual.getMonth()).toEqual(month);
            expect(actual.getDate()).toEqual(day);
        });
    });
});

describe('daysBetween-test', () => {
    it('same startDate and endDate', () => {
        const startDate = new Date(2024, 1 - 1, 31);
        const endDate = new Date(2024, 1 - 1, 31);

        const result = D.daysBetween(startDate, endDate);
        expect(result).toEqual(1);
    });

    it('startDate < endDate', () => {
        const startDate = new Date(2024, 1 - 1, 31);
        const endDate = new Date(2024, 2 - 1, 3);

        const result = D.daysBetween(startDate, endDate);
        expect(result).toEqual(4);
    });

    it('startDate > endDate is UB', () => {
        
    });

    it('ignores time granuality', () => {
        const startDate = new Date(2024, 1 - 1, 31, 23, 59, 59);
        const endDate = new Date(2024, 2 - 1, 1, 0, 0, 1);

        const result = D.daysBetween(startDate, endDate);
        expect(result).toEqual(2);
    });
});
function millisecondsInDay() {
    const hoursInDay = 24;
    const secondsInHour = 60 * 60;
    const millisecondsInSecond = 1000;
    return hoursInDay * secondsInHour * millisecondsInSecond;
}

class DateArithmetic {
    constructor(private date: Date) {}

    applyDelta({ days }: { days: number }) {
        const millisecondsSinceUTC = this.date.getTime();
        const deltaInMilliseconds = (days * millisecondsInDay());
        this.date.setTime(millisecondsSinceUTC + deltaInMilliseconds);
        return this;
    }
    
    equals() {
        return clone(this.date);
    }
}

export function clone(date: Date) {
    const cloned = new Date();
    cloned.setTime(date.getTime());
    return cloned;
}

export function calculateFrom(date: Date) {
    return new DateArithmetic(clone(date));
}

export function *xrange(startDate: Date, endDate: Date) {
    startDate = clone(startDate);
    endDate = clone(endDate);

    startDate.setUTCHours(/* hrs */ 12, /* mins */ 0, /* secs */ 0, /* millisecs */ 0);
    endDate.setUTCHours(/* hrs */ 12, /* mins */ 0, /* secs */ 0, /* millisecs */ 0);

    let currDate = clone(startDate);

    while (currDate <= endDate) {
        yield currDate;
        currDate = clone(currDate);
        currDate.setTime(currDate.getTime() + millisecondsInDay());
    }
}

export function daysBetween(startDate: Date, endDate: Date) {
    startDate = clone(startDate);
    endDate = clone(endDate);

    startDate.setUTCHours(/* hrs */ 12, /* mins */ 0, /* secs */ 0, /* millisecs */ 0);
    endDate.setUTCHours(/* hrs */ 12, /* mins */ 0, /* secs */ 0, /* millisecs */ 0);

    const millisecondsBetween = endDate.getTime() - startDate.getTime();

    return Math.round(millisecondsBetween / millisecondsInDay()) + 1;
}

export function renderDate(date: Date) {
    const months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
    return `${date.getDate()}/${months[date.getMonth()]}/${date.getFullYear()}`
}
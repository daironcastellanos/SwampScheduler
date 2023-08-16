import { API_Day, API_MeetTime } from "@scripts/apiTypes";
import { Term } from "@constants/soc";
import { PERIOD_COUNTS } from "@constants/schedule";

export class MeetTime {
    term: Term;
    pBegin: number;
    pEnd: number;
    bldg: string;
    room: string;
    locationID: string | null;

    constructor(term: Term, meetTimeJSON: API_MeetTime) {
        this.term = term;
        this.pBegin = this.parsePeriod(meetTimeJSON.meetPeriodBegin);
        this.pEnd = this.parsePeriod(meetTimeJSON.meetPeriodEnd);
        this.bldg = meetTimeJSON.meetBuilding;
        this.room = meetTimeJSON.meetRoom;
        this.locationID = meetTimeJSON.meetBldgCode;

        // Assume length is one period if either pBegin or pEnd is NaN
        if (isNaN(this.pBegin)) this.pBegin = this.pEnd;
        if (isNaN(this.pEnd)) this.pEnd = this.pBegin;

        // If the meeting is online, there is no location
        if (this.locationID == "WEB") this.locationID = null;
    }

    private parsePeriod(period: string): number {
        if (period) {
            if (period.charAt(0) == "E") {
                const periodCounts = PERIOD_COUNTS[this.term];
                return periodCounts.regular + parseInt(period.substring(1));
            }
            return parseInt(period);
        }
        return NaN;
    }

    static formatPeriod(p: number, term: Term) {
        const periodCounts = PERIOD_COUNTS[term];
        return p > periodCounts.regular
            ? `E${p - periodCounts.regular}`
            : `${p}`;
    }

    formatPeriods(): string {
        return this.pBegin == this.pEnd
            ? MeetTime.formatPeriod(this.pBegin, this.term)
            : `${MeetTime.formatPeriod(
                  this.pBegin,
                  this.term,
              )}-${MeetTime.formatPeriod(this.pEnd, this.term)}`;
    }

    // Returns true if the meet times conflict (overlap)
    conflictsWith(other: MeetTime): boolean {
        return this.pBegin <= other.pEnd && this.pEnd >= other.pBegin;
    }
}

export type Meetings = Record<API_Day, MeetTime[]>;

export function noMeetings(): Meetings {
    return {
        [API_Day.Mon]: [],
        [API_Day.Tue]: [],
        [API_Day.Wed]: [],
        [API_Day.Thu]: [],
        [API_Day.Fri]: [],
        [API_Day.Sat]: [],
    };
}

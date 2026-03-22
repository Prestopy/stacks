import { endOfDay, formatRelative, startOfDay } from "date-fns";
import dayjs from "dayjs";

type DateParam = Date | bigint;

export function toDate(value: DateParam): Date {
	if (typeof value === "bigint") return new Date(Number(value));
	return value;
}

export function toBigInt(value: DateParam): bigint {
	if (typeof value === "bigint") return value;
	return BigInt(value.getTime());
}

export function toDateOrUndefined(value: DateParam | undefined): Date | undefined {
	if (value === undefined) return undefined;
	return toDate(value);
}

export function today() {
	return new Date(new Date().setHours(0, 0, 0, 0));
}

/**
 * Checks if two dates are on the same calendar day (ignoring time).
 * @param _date1
 * @param _date2
 */
export function isSameDay(_date1: DateParam, _date2: DateParam) {
	const date1 = toDate(_date1);
	const date2 = toDate(_date2);

	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
}

/**
 * Checks if the given date is today (regardless of time).
 * @param _date
 */
export function isToday(_date: DateParam) {
	return isSameDay(_date, today());
}

/**
 * Checks if the given date is exactly at midnight.
 * @param _date
 */
export function isExactDate(_date: DateParam) {
	const date = toDate(_date);
	return (
		date.getHours() === 0 &&
		date.getMinutes() === 0 &&
		date.getSeconds() === 0 &&
		date.getMilliseconds() === 0
	)
}

export function toExactDate(_date: DateParam) {
	const date = toDate(_date);
	return startOfDay(date);
}

/**
 * Checks if the given date is before the reference date.
 * @param _date
 * @param _ref
 */
export function isLate(_date: DateParam, _ref: DateParam = today()) {
	const date = toDate(_date);
	const ref = endOfDay(toDate(_ref));
	return dayjs(date).isBefore(ref);
}

export function isLateOrToday(date: DateParam, ref: DateParam = today()) {
	return isLate(date, ref) || isToday(date);
}

export function getDaysBetweenDates(_d1: DateParam, _d2: DateParam) {
	const d1 = toDate(_d1);
	const d2 = toDate(_d2);

	// Normalize dates to UTC midnight
	const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
	const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());

	const msPerDay = 1000 * 60 * 60 * 24;
	return Math.floor((utc1 - utc2) / msPerDay);
}

export function getDifferenceInDaysAsString(_date: DateParam, _ref: DateParam) {
	const ref = toDate(_ref);
	const date = toDate(_date);
	const diff = getDaysBetweenDates(date, ref);

	if (diff > 0) {
		return `in ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""}`;
	} else if (diff === 0) {
		return "today";
	} else {
		return `${Math.abs(diff)} day${diff !== 1 ? "s" : ""} ago`;
	}
}

export function formatDateAsRelative(_date: DateParam, _ref: DateParam) {
	const date = toDate(_date);
	const ref = toDate(_ref);
	const parts = formatRelative(date, ref).split(" ");

	if (isExactDate(date)) {
		// If the time is exactly midnight, only return the date part
		if (parts.length <= 3) return parts[0];
		return parts.slice(0, parts.length-3).join(" ");
	} else {
		return parts.join(" ");
	}
}

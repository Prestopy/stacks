import { Id } from "@/convex/_generated/dataModel";
import { FilterView, IconData } from "@/app/util/types";

export default class Constants {
	static DEBUG_USER_ID: Id<"users"> =
		"jh73g1ejgxweeh47w4rbmqz5x17y1j05" as Id<"users">;

	static Colors = {
		DEFAULT: undefined,

		INBOX_BLUE: "oklch(68.5% 0.169 237.323)", // sky-500
		TODAY_YELLOW: "oklch(79.5% 0.184 86.047)", // yellow-500
		EVERYTHING_GREEN: "oklch(60% 0.118 184.704)", // teal-600
		SOMEDAY_BROWN: "oklch(68% 11% 66)",
		SCHEDULED_RED: "oklch(65.6% 0.241 354.308)", // pink-500
		FLAGGED_PURPLE: "oklch(66.7% 0.295 322.15)",
		COMPLETED_GREEN: "oklch(59.6% 0.145 163.225)", // emerald-600

		LATE_RED: "oklch(63.7% 0.237 25.331)", // red-500
	} as const;

	static TailwindColors = {
		INBOX_BLUE: "sky-500",
		TODAY_YELLOW: "yellow-500",
		EVERYTHING_GREEN: "teal-600",
		SOMEDAY_BROWN: "[oklch(68%_11%_66)]",
		SCHEDULED_RED: "pink-500",
		FLAGGED_PURPLE: "[oklch(66.7%_0.295_322.15)]",
		COMPLETED_GREEN: "emerald-600",

		LATE_RED: "red-500",
	}

	static Icons: {
		[key in string]: IconData;
	} = {
		INBOX: {
			name: "IconInbox",
			color: Constants.Colors.INBOX_BLUE,
		},
		TODAY: {
			name: "IconStarFilled",
			color: Constants.Colors.TODAY_YELLOW,
		},
		EVERYTHING: {
			name: "IconStarFilled",
			color: Constants.Colors.EVERYTHING_GREEN,
		},
		SOMEDAY: {
			name: "IconArchiveFilled",
			color: Constants.Colors.SOMEDAY_BROWN,
		},
		SCHEDULED: {
			name: "IconCalendarWeek",
			color: Constants.Colors.SCHEDULED_RED,
		},
		UNFLAGGED: {
			name: "IconTriangle",
			color: Constants.Colors.DEFAULT,
		},
		FLAGGED: {
			name: "IconTriangleFilled",
			color: Constants.Colors.FLAGGED_PURPLE,
		},
		COMPLETED: {
			name: "IconSquareCheckFilled",
			color: Constants.Colors.COMPLETED_GREEN,
		},

		START_DATE: {
			name: "IconCalendarWeek",
		},
		DEADLINE: {
			name: "IconFlag3Filled",
		},
	};

	static DynamicIcons: {
		[key in string]: (
			c: (typeof Constants.Colors)[keyof typeof Constants.Colors],
		) => IconData;
	} = {
		PROJECT: (c) => ({
			name: "IconCircle",
			color: c,
		}),
	};

	static FilterViews: Record<string, FilterView> = {
		INBOX: {
			kind: "system_filter",
			id: "inbox",

			iconName: Constants.Icons.INBOX.name,
			color: Constants.Colors.INBOX_BLUE,
			title: "Inbox",
			description: "Orphan tasks that do not belong to a universe.",

			layout: "list",
		},
		TODAY: {
			kind: "system_filter",
			id: "today",

			iconName: Constants.Icons.TODAY.name,
			color: Constants.Colors.TODAY_YELLOW,
			title: "Today",
			description: "Tasks that you should get done today.",

			layout: "list",
		},
		EVERYTHING: {
			kind: "system_filter",
			id: "everything",

			iconName: Constants.Icons.EVERYTHING.name,
			color: Constants.Colors.EVERYTHING_GREEN,
			title: "Everything",
			description: "Every task that is currently incomplete.",

			layout: "list",
		},
		FLAGGED: {
			kind: "system_filter",
			id: "flagged",

			iconName: Constants.Icons.FLAGGED.name,
			color: Constants.Colors.FLAGGED_PURPLE,
			title: "Flagged",
			description: "Tasks that you flagged for importance.",

			layout: "list",
		},
		SOMEDAY: {
			kind: "system_filter",
			id: "someday",

			iconName: Constants.Icons.SOMEDAY.name,
			color: Constants.Colors.SOMEDAY_BROWN,
			title: "Someday",
			description: "Tasks that shouldn't be a priority right now.",

			layout: "list",
		},

		SCHEDULE: {
			kind: "system_filter",
			id: "schedule",

			iconName: Constants.Icons.SCHEDULED.name,
			color: Constants.Colors.SCHEDULED_RED,
			title: "Schedule",

			layout: "schedule",
		},

		COMPLETED: {
			kind: "system_filter",
			id: "completed",

			iconName: Constants.Icons.COMPLETED.name,
			color: Constants.Colors.COMPLETED_GREEN,
			title: "Completed",
			description: "Tasks that you already completed.",

			layout: "list",
		},
	};
}

export type TaskView = FilterView | StackView;
export type FilterView = {
	isFilterView: true;
	layout: "list" | "schedule";

	title: string;
	icon: string;
	description?: string;
}
export type StackView = {
	isFilterView: false;
	layout: "list";

	id: string;
	title: string;
	icon: string;
	description?: string;
};

export const FILTER_VIEWS: Record<string, FilterView> = {
	INBOX: {
		isFilterView: true,

		icon: "📭",
		title: "Inbox",
		description: "Tasks without a specific stack.",

		layout: "list",
	},
	TODAY: {
		isFilterView: true,

		icon: "⭐",
		title: "Today",
		description: "Tasks that you should get done today.",

		layout: "list",
	},
	FLAGGED: {
		isFilterView: true,

		icon: "🚩",
		title: "Flagged",
		description: "Tasks that you flagged for importance.",

		layout: "list",
	},
	SOMEDAY: {
		isFilterView: true,

		icon: "📦",
		title: "Someday",
		description: "Tasks that shouldn't be a priority right now.",

		layout: "list",
	},

	SCHEDULE: {
		isFilterView: true,

		icon: "📅",
		title: "Schedule",

		layout: "schedule",
	},

	COMPLETED: {
		isFilterView: true,

		icon: "✅",
		title: "Completed",
		description: "Tasks that you already completed.",

		layout: "list",
	}
}
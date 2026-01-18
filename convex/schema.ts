import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	taskItems: defineTable({
		title: v.string(),
		note: v.optional(v.string()),
		isCompleted: v.boolean(),
		isFlagged: v.boolean(),
		isSomeday: v.boolean(),
		startDate: v.optional(v.int64()),
		deadline: v.optional(v.int64()),

		// Relations
		parentUniverse: v.optional(v.id("universes")),
		parentProject: v.optional(v.id("projects")),
		parentTaskFolder: v.optional(v.id("taskFolders")),
		parentTaskItem: v.optional(v.id("taskItems")),

		user: v.id("users"),
	})
		.index("by_completion", ["isCompleted"])
		.index("by_parentUniverse", ["parentUniverse"])
		.index("by_parentProject", ["parentProject"])
		.index("by_parentTaskFolder", ["parentTaskFolder"]),

	taskFolders: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		iconName: v.optional(v.string()),
		color: v.optional(v.string()),

		// Relations
		parentUniverse: v.id("universes"),
		parentProject: v.optional(v.id("projects")),

		user: v.id("users"),
	})
		.index("by_parentUniverse", ["parentUniverse"])
		.index("by_parentProject", ["parentProject"]),

	projects: defineTable({
		title: v.string(),
		description: v.optional(v.string()),

		iconName: v.optional(v.string()),
		color: v.optional(v.string()),
		deadline: v.optional(v.int64()),

		// Relations
		parentUniverse: v.id("universes"),

		user: v.id("users"),
	})
		.index("by_parentUniverse", ["parentUniverse"]),

	universes: defineTable({
		title: v.string(),
		description: v.optional(v.string()),

		iconName: v.optional(v.string()),
		color: v.optional(v.string()),

		user: v.id("users"),
	}),
	users: defineTable({
		firstName: v.string(),
		lastName: v.string(),
	}),
});

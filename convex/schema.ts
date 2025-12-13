import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	taskItems: defineTable({
		title: v.string(),
		note: v.optional(v.string()),
		isCompleted: v.boolean(),
		startDate: v.optional(v.int64()),
		deadline: v.optional(v.int64()),

		// Relations
		parentStack: v.id("stacks"),

		parentTaskItem: v.optional(v.id("taskItems")),
		childTaskItems: v.optional(v.array(v.id("taskItems"))),

		user: v.id("users"),
	}),
	taskFolders: defineTable({
		title: v.string(),
		description: v.optional(v.string()),

		// Relations
		childTaskItems: v.array(v.id("taskItems")),

		parentStack: v.id("stacks"),

		user: v.id("users"),
	}),
	stacks: defineTable({
		title: v.string(),
		description: v.optional(v.string()),
		deadline: v.optional(v.int64()),

		// Relations
		childTaskItems: v.array(v.id("taskItems")),

		childTaskFolders: v.array(v.id("taskFolders")),

		user: v.id("users"),
	}),
	users: defineTable({
		firstName: v.string(),
		lastName: v.string(),
	})
});
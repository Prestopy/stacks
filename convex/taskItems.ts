import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Queries
export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("taskItems").collect();
	},
});
// export const getTasksForView = query({
// 	args: {
// 		view: v.union(
// 			v.object({
// 				kind: v.literal("stack"),
// 				id: v.id("stacks"),
// 			}),
// 			v.object({
// 				kind: v.literal("system_filter"),
// 				id: v.string(),
// 			})
// 		)
// 	},
// 	handler: async (ctx, args) => {
// 		if (args.view.kind === "stack") {
// 			const stack = await ctx.db.get(args.view.id);
// 			if (!stack) return [];
//
// 			const q = ctx.db
// 				.query("taskItems")
// 				.withIndex("by_stack", q =>
// 					q.eq("parentUniverse", stack._id)
// 				)
//
// 			return await q.collect()
// 		} else {
// 			switch(args.view.id) {
// 				case "inbox": {
// 					const q = ctx.db
// 						.query("taskItems")
// 						.withIndex("by_completion_stack", q =>
// 							q
// 								.eq("isCompleted", false)
// 								.eq("parentUniverse", undefined)
// 						)
//
// 					return await q.collect()
// 				}
// 				case "today": {
// 					const q = ctx.db
// 						.query("taskItems")
// 						.withIndex("by_completion", q =>
// 							q.eq("isCompleted", false)
// 						)
// 						.filter((task) => {
// 							const startOfTomorrow = new Date();
// 							startOfTomorrow.setHours(24, 0, 0, 0);
//
// 							return task.lt(task.field("startDate"), startOfTomorrow.getTime());
//
// 						})
// 					return await q.collect()
// 				}
// 				case "completed": {
// 					const q = ctx.db
// 						.query("taskItems")
// 						.withIndex("by_completion", q =>
// 							q.eq("isCompleted", true)
// 						)
//
// 					return await q.collect()
// 				}
//
// 				default:
// 					return await ctx.db.query("taskItems").collect();
// 			}
// 		}
// 	},
// });

// Mutations
export const createTaskItem = mutation({
	args: {
		data: v.object({
			title: v.string(),
			note: v.optional(v.string()),
			isCompleted: v.boolean(),
			isFlagged: v.boolean(),
			isSomeday: v.boolean(),
			startDate: v.optional(v.int64()),
			deadline: v.optional(v.int64()),

			// Relations
			// parentUniverse: v.optional(v.id("stacks")),
			//
			// parentTaskItem: v.optional(v.id("taskItems")),
			// childTaskItems: v.optional(v.array(v.id("taskItems"))),
		}),
		_parentUniverseId: v.optional(v.id("universes")),
		_parentProjectId: v.optional(v.id("projects")),
		_userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		if (args._parentProjectId && args._parentUniverseId) {
			throw new Error(
				"only one or none can be provided from: _parentUniverseId or _parentProjectId.",
			);
		}

		if (args._parentProjectId) {
			const project = await ctx.db.get("projects", args._parentProjectId);
			if (!project) throw new Error("Project not found");

			return await ctx.db.insert("taskItems", {
				...args.data,
				parentUniverse: project.parentUniverse,
				parentProject: args._parentProjectId,
				user: args._userId,
			});
		} else {
			return await ctx.db.insert("taskItems", {
				...args.data,
				parentUniverse: args._parentUniverseId,
				user: args._userId,
			});
		}
	},
});

export const updateTaskItem = mutation({
	args: {
		_taskId: v.id("taskItems"),
		modifications: v.object({
			title: v.optional(v.string()),
			note: v.optional(v.union(v.string(), v.null())),
			isCompleted: v.optional(v.boolean()),
			isFlagged: v.optional(v.boolean()),
			isSomeday: v.optional(v.boolean()),
			startDate: v.optional(v.union(v.int64(), v.null())),
			deadline: v.optional(v.union(v.int64(), v.null())),

			// Relations
			parentUniverse: v.optional(v.union(v.id("universes"), v.null())),
			parentProject: v.optional(v.union(v.id("projects"), v.null())),
			parentTaskFolder: v.optional(
				v.union(v.id("taskFolders"), v.null()),
			),
			parentTaskItem: v.optional(v.union(v.id("taskItems"), v.null())),

			// user: v.id("users"),
		}),
	},
	handler: async (ctx, args) => {
		if (args.modifications.parentProject && args.modifications.parentUniverse) {
			throw new Error(
				"only one or none can be provided from: _parentUniverseId or _parentProjectId.",
			);
		}

		if (args.modifications.parentProject) {
			const project = await ctx.db.get(
				"projects",
				args.modifications.parentProject,
			);
			if (!project) throw new Error("Project not found");

			args.modifications.parentUniverse = project.parentUniverse;
		}

		for (const key in args.modifications) {
			if (
				args.modifications[key as keyof typeof args.modifications] ===
				null
			) {
				args.modifications[key as keyof typeof args.modifications] =
					undefined;
			}
		}

		return await ctx.db.patch(
			"taskItems",
			args._taskId,
			// @ts-expect-error - null to undefined conversion
			args.modifications,
		);
	},
});

export const deleteTaskItem = mutation({
	args: {
		_taskId: v.id("taskItems"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args._taskId);
	},
});

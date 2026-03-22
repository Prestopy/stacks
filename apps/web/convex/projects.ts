import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("projects").collect();
	},
});

export const createProject = mutation({
	args: {
		data: v.object({
			title: v.string(),
			iconName: v.optional(v.string()),
			color: v.optional(v.string()),
			description: v.optional(v.string()),
			deadline: v.optional(v.int64()),
		}),
		_parentUniverseId: v.id("universes"),
		_userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		try {
			return await ctx.db.insert("projects", {
				...args.data,
				parentUniverse: args._parentUniverseId,
				user: args._userId,
			});
		} catch (e) {
			throw new Error("Failed to create universe: " + e);
		}
	},
});

export const updateProject = mutation({
	args: {
		_projectId: v.id("projects"),
		modifications: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.nullable(v.string())),

			iconName: v.optional(v.nullable(v.string())),
			color: v.optional(v.nullable(v.string())),
			deadline: v.optional(v.nullable(v.int64())),

			parentUniverse: v.optional(v.id("universes")),

			// user: v.id("users"),
		}),
	},
	handler: async (ctx, args) => {
		try {
			for (const key in args.modifications) {
				if (
					args.modifications[
						key as keyof typeof args.modifications
					] === null
				) {
					args.modifications[key as keyof typeof args.modifications] =
						undefined;
				}
			}

			return await ctx.db.patch(
				"projects",
				args._projectId,
				// @ts-expect-error - null to undefined conversion
				args.modifications,
			);
		} catch (e) {
			throw new Error("Failed to update universe: " + e);
		}
	},
});

export const deleteProject = mutation({
	args: {
		_projectId: v.id("projects"),
	},
	handler: async (ctx, args) => {
		try {
			const tasksInProject = await ctx.db
				.query("taskItems")
				.withIndex("by_parentProject", (q) =>
					q.eq("parentProject", args._projectId),
				)
				.collect();

			await Promise.all(
				tasksInProject.map((task) => {
					return ctx.db.delete("taskItems", task._id);
				})
			);

			const taskFoldersInProject = await ctx.db
				.query("taskFolders")
				.withIndex("by_parentProject", (q) =>
					q.eq("parentProject", args._projectId),
				)
				.collect();

			await Promise.all(
				taskFoldersInProject.map((folder) => {
					return ctx.db.delete("taskFolders", folder._id);
				})
			);

			return await ctx.db.delete(args._projectId);
		} catch (e) {
			throw new Error("Failed to delete project: " + e);
		}
	},
});

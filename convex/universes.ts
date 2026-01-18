import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query("universes").collect();
	},
});

export const createUniverse = mutation({
	args: {
		data: v.object({
			title: v.string(),
			iconName: v.optional(v.string()),
			color: v.optional(v.string()),
			description: v.optional(v.string()),
		}),
		_userId: v.id("users"),
	},
	handler: async (ctx, args) => {
		try {
			return await ctx.db.insert("universes", {
				...args.data,
				user: args._userId,
			});
		} catch (e) {
			throw new Error("Failed to create universe: " + e);
		}
	},
});

export const updateUniverse = mutation({
	args: {
		_universeId: v.id("universes"),
		modifications: v.object({
			title: v.optional(v.string()),
			description: v.optional(v.nullable(v.string())),
			iconName: v.optional(v.nullable(v.string())),
			color: v.optional(v.nullable(v.string())),

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
				"universes",
				args._universeId,
				// @ts-expect-error - null to undefined conversion
				args.modifications,
			);
		} catch (e) {
			throw new Error("Failed to update universe: " + e);
		}
	},
});

export const deleteUniverse = mutation({
	args: {
		_universeId: v.id("universes"),
	},
	handler: async (ctx, args) => {
		try {
			// FIXME: Deleting a universe does not delete its projects or tasks for data safety.
			const tasksInUniverse = await ctx.db
				.query("taskItems")
				.withIndex("by_parentUniverse", (q) =>
					q.eq("parentUniverse", args._universeId),
				)
				.collect();

			await Promise.all(tasksInUniverse.map((task) => {
				return ctx.db.delete("taskItems", task._id);
			}));

			const foldersInUniverse = await ctx.db
				.query("taskFolders")
				.withIndex("by_parentUniverse", (q) =>
					q.eq("parentUniverse", args._universeId),
				)
				.collect();

			await Promise.all(foldersInUniverse.map((folder) => {
				return ctx.db.delete("taskFolders", folder._id);
			}));


			const projectsInUniverse = await ctx.db
				.query("projects")
				.withIndex("by_parentUniverse", (q) =>
					q.eq("parentUniverse", args._universeId),
				)
				.collect();

			await Promise.all(projectsInUniverse.map((project) => {
				return ctx.db.delete("projects", project._id);
			}));

			return await ctx.db.delete(args._universeId);
		} catch (e) {
			throw new Error("Failed to delete universe: " + e);
		}
	},
});

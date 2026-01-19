export type OptionalWithNull<T> = {
	[K in keyof T]: undefined extends T[K] ? Exclude<T[K], undefined> | null | undefined : T[K];
};

/**
 * A utility type to group action functions for creating, modifying, and deleting entities.
 * @param CreateFn - The type of the create function. Defaults to null.
 * @param ModifyFn - The type of the modify function. Defaults to null.
 * @param DeleteFn - The type of the delete function. Defaults to null.
 */
export type Actions<
	CreateFn = null,
	ModifyFn = null,
	DeleteFn = null
> = {
	create: CreateFn;
	modify: ModifyFn;
	delete: DeleteFn;
};

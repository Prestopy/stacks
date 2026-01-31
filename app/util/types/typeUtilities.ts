export type OptionalWithNull<T> = {
	[K in keyof T]: undefined extends T[K] ? Exclude<T[K], undefined> | null | undefined : T[K];
};

type CreateAction<Fn> = {
	create: Fn;
};

type ModifyAction<Fn> = {
	modify: Fn;
};

type DeleteAction<Fn> = {
	delete: Fn;
};

// Global scope: acts on collections
export type GlobalActions<CreateFn, DeleteFn> =
	CreateAction<CreateFn> &
	DeleteAction<DeleteFn>;

// Entity scope: acts on a single instance
export type EntityActions<ModifyFn, DeleteFn> =
	ModifyAction<ModifyFn> &
	DeleteAction<DeleteFn>;

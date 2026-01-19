export type OptionalWithNull<T> = {
	[K in keyof T]: undefined extends T[K] ? Exclude<T[K], undefined> | null | undefined : T[K];
};

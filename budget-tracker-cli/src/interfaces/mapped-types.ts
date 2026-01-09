// Mapped types for the application

export type ReadonlyAccount = {
  readonly [K in keyof import('./IAccount').IAccount]: import('./IAccount').IAccount[K];
};

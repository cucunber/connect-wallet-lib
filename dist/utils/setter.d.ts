export declare function set<T, K>(obj: T, newObj: K): T & {
    [Key in keyof K]: K[Key];
};

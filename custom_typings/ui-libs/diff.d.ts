export declare function diff<T>(a: T[], b: T[], cmp?: (x: T, y: T) => boolean): {
    type: string;
    element?: T;
    bi?: number;
    ai?: number;
}[];

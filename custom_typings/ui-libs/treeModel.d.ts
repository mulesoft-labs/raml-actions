export declare class Node<T, V> {
    parent: Node<T, V>;
    data: T;
    view: V;
    container: V;
    children: Node<T, V>[];
    constructor(parent?: Node<T, V>, data?: T, view?: V, container?: V);
    indexOf(predicate: (node: Node<T, V>) => boolean): number;
    addChild(child: Node<T, V>, index?: number): void;
    removeChild(element?: number | Node<T, V>): void;
}
export declare class TreeModel<T, V> {
    private root;
    private flat;
    private find(parent);
    findElement(callback: (element: T) => boolean): T;
    clear(): void;
    insert(element: T, parent: Node<T, V>, neighbour?: Node<T, V>, after?: boolean): void;
    insertBefore(node: Node<T, V>, parent: Node<T, V>, before?: Node<T, V>): void;
    insertAfter(node: Node<T, V>, parent: Node<T, V>, after?: Node<T, V>): void;
    remove(node: Node<T, V>): void;
    get(element: T, parent?: Node<T, V>): Node<T, V>;
    constructor(rootComponent: V);
    registerViews(element: T, view: V, container: V): void;
    patch(before: T, after: T): void;
}

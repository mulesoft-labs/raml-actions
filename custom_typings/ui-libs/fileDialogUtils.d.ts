/**
 * In example : { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
 */
export interface ExtensionFilter {
    name: string;
    extensions: string[];
}
export declare function openFileDialogModal(title: string, defaultPath?: string, filters?: ExtensionFilter[]): string;
export declare function openFileDialog(title: string, callBack: (path: string) => void, defaultPath?: string, filters?: ExtensionFilter[]): void;
export declare function openFolderDialogModal(title: string, createDirectory?: boolean, defaultPath?: string, filters?: ExtensionFilter[]): string;
export declare function openFolderDialog(title: string, callBack: (path: string) => void, createDirectory?: boolean, defaultPath?: string, filters?: ExtensionFilter[]): void;
export declare function saveFileDialogModal(title: string, defaultPath?: string, filters?: ExtensionFilter[]): string;
export declare function getHome(): any;

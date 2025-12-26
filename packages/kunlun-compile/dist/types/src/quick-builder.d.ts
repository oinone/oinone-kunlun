import { Plugin as RollupPlugin } from 'rollup';
interface QuickBuilderOptions {
    pkg: {
        name: string;
        version: string;
        dependencies?: Record<string, unknown>;
        devDependencies?: Record<string, unknown>;
    };
    prefix?: boolean;
    includeExternal?: string[];
    excludeExternal?: string[];
    hasVue?: boolean;
    hasSCSS?: boolean;
    ugly?: boolean;
    keep_classnames?: boolean;
    extendPlugins?: RollupPlugin[];
    outputEntryFiles?: boolean;
    copyTypeFiles?: boolean | string;
}
export declare const rollupConfig: ({ pkg, prefix, includeExternal, excludeExternal, hasVue, hasSCSS, ugly, keep_classnames, extendPlugins, outputEntryFiles, copyTypeFiles }: QuickBuilderOptions) => import("rollup").RollupOptions;
export {};

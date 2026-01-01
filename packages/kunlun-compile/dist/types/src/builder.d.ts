import { type OutputOptions as RollupOutputOptions, type Plugin as RollupPlugin, type RollupOptions } from 'rollup';
import { type RollupReplaceOptions } from '@rollup/plugin-replace';
import { type CSSPluginOptions as SCSSPluginOptions } from 'rollup-plugin-scss';
import { type Options as VuePluginOptions } from 'rollup-plugin-vue';
import { type RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import { type RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import { type RollupTypescriptPluginOptions } from '@rollup/plugin-typescript';
import { type RPT2Options as RollupTypescript2PluginOptions } from 'rollup-plugin-typescript2';
import { type RollupJsonOptions } from '@rollup/plugin-json';
import { type CopyOptions as RollupCopyPluginOptions } from 'rollup-plugin-copy';
import { type Options as RollupTerserPluginOptions } from '@rollup/plugin-terser';
import { type SourcemapsPluginOptions } from 'rollup-plugin-sourcemaps';
type RollupExternalType = string | RegExp | ((id: string) => boolean);
type RollupExternalTypes = RollupExternalType | RollupExternalType[];
type RollupBuildOptions = {
    debug?: boolean;
    output?: RollupOutputOptions;
    outputOverride?: RollupOutputOptions | RollupOutputOptions[];
};
export declare class CompileConfigBuilder {
    private _debug;
    private _libraryName;
    private _pathName;
    private _camelCaseName;
    private _external;
    private _pluginBuilder;
    static config(debug?: boolean): CompileConfigBuilder;
    prefix(packageJsonName: string, prefix?: string): CompileConfigBuilder;
    get libraryName(): string | undefined;
    set libraryName(val: string);
    setLibraryName(val: string): CompileConfigBuilder;
    get pathName(): string | undefined;
    set pathName(val: string | undefined);
    setPathName(val: string | undefined): CompileConfigBuilder;
    get camelCaseName(): string | undefined;
    set camelCaseName(val: string | undefined);
    setCamelCaseName(val: string | undefined): CompileConfigBuilder;
    get isDebug(): boolean;
    external(val: RollupExternalTypes): CompileConfigBuilder;
    singleModule(): RollupSingleModulePluginBuilder;
    multipleModule(): RollupMultipleModulePluginBuilder;
    build(options?: RollupBuildOptions, plugins?: RollupPlugin[]): RollupOptions;
}
declare class AbstractPluginBuilder {
    protected readonly _builder: CompileConfigBuilder;
    protected constructor(builder: CompileConfigBuilder);
    protected _replace: RollupReplaceOptions | undefined;
    protected _scss: SCSSPluginOptions | undefined;
    protected _vue: VuePluginOptions | undefined;
    protected _nodeResolve: RollupNodeResolveOptions | undefined;
    protected _commonjs: RollupCommonJSOptions | undefined;
    protected _typescript: RollupTypescriptPluginOptions | undefined;
    protected _typescript2: RollupTypescript2PluginOptions | undefined;
    protected _json: RollupJsonOptions | undefined;
    protected _copy: RollupCopyPluginOptions | undefined;
    protected _terser: RollupTerserPluginOptions | undefined;
    protected _sourcemaps: SourcemapsPluginOptions | undefined;
    protected _plugins: RollupPlugin[] | undefined;
    get libraryName(): string | undefined;
    get pathName(): string | undefined;
    get camelCaseName(): string | undefined;
    replace(config?: boolean | RollupReplaceOptions): typeof this;
    scss(config?: boolean | SCSSPluginOptions): typeof this;
    vue(config?: boolean | Partial<VuePluginOptions>): typeof this;
    nodeResolve(config?: boolean | RollupNodeResolveOptions): typeof this;
    commonjs(config?: boolean | RollupCommonJSOptions): typeof this;
    typescript(config?: boolean | RollupTypescriptPluginOptions): typeof this;
    typescript2(config?: boolean | RollupTypescript2PluginOptions): typeof this;
    json(config?: boolean | RollupJsonOptions): typeof this;
    terser(config?: boolean | RollupTerserPluginOptions): typeof this;
    sourcemaps(config?: boolean | SourcemapsPluginOptions): typeof this;
    copy(config?: boolean | RollupCopyPluginOptions): typeof this;
    copyTypeFiles(typesDir: string, deleteDir: string | string[]): typeof this;
    plugins(val: RollupPlugin | RollupPlugin[]): this;
    protected $$setPluginOptions<V>(setter: (val: V | undefined) => void, config: boolean | V, defaultConfig: V): typeof this;
    build(options?: RollupBuildOptions): RollupOptions;
    protected defaultTypescriptCompilerOptions: {
        outDir: string;
        declaration: boolean;
        declarationDir: string;
        moduleResolution: string;
        incremental: boolean;
        sourceMap: boolean;
    };
    private buildPlugins;
}
declare class RollupSingleModulePluginBuilder extends AbstractPluginBuilder {
    constructor(builder: CompileConfigBuilder);
    typescript(val?: boolean | RollupTypescriptPluginOptions): typeof this;
    typescript2(val?: boolean | RollupTypescript2PluginOptions): typeof this;
}
declare class RollupMultipleModulePluginBuilder extends AbstractPluginBuilder {
    constructor(builder: CompileConfigBuilder);
    typescript(config?: boolean | RollupTypescriptPluginOptions): typeof this;
    typescript2(config?: boolean | RollupTypescript2PluginOptions): typeof this;
}
export {};

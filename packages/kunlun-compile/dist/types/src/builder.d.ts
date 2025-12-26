import { OutputOptions as RollupOutputOptions, Plugin as RollupPlugin, RollupOptions } from 'rollup';
import { RollupReplaceOptions } from '@rollup/plugin-replace';
import { CSSPluginOptions as SCSSPluginOptions } from 'rollup-plugin-scss';
import { Options as VuePluginOptions } from 'rollup-plugin-vue';
import { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import { RollupTypescriptPluginOptions } from '@rollup/plugin-typescript';
import { RPT2Options as RollupTypescript2PluginOptions } from 'rollup-plugin-typescript2';
import { RollupJsonOptions } from '@rollup/plugin-json';
import { CopyOptions as RollupCopyPluginOptions } from 'rollup-plugin-copy';
import { Options as RollupTerserPluginOptions } from '@rollup/plugin-terser';
import { SourcemapsPluginOptions } from 'rollup-plugin-sourcemaps';
type RollupExternalType = string | RegExp | ((id: string) => boolean);
type RollupExternalTypes = RollupExternalType | RollupExternalType[];
type RollupBuildOptions = {
    output?: RollupOutputOptions;
    outputOverride?: RollupOutputOptions | RollupOutputOptions[];
};
export declare class CompileConfigBuilder {
    private _libraryName;
    private _pathName;
    private _camelCaseName;
    private _external;
    private _pluginBuilder;
    static config(): CompileConfigBuilder;
    prefix(packageJsonName: string, prefix?: string): CompileConfigBuilder;
    libraryName(val: string): CompileConfigBuilder;
    getLibraryName(): string | undefined;
    getPathName(): string | undefined;
    getCamelCaseName(): string | undefined;
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
    getLibraryName(): string | undefined;
    getPathName(): string | undefined;
    getCamelCaseName(): string | undefined;
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
    copyTypeFiles(typesDir?: string): typeof this;
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
        verbatimModuleSyntax: boolean;
        isolatedModules: boolean;
        importHelpers: boolean;
        stripInternal: boolean;
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

import { OutputOptions as RollupOutputOptions, Plugin as RollupPlugin, RollupOptions } from 'rollup';
import replace, { RollupReplaceOptions } from '@rollup/plugin-replace';
import scss, { CSSPluginOptions as SCSSPluginOptions } from 'rollup-plugin-scss';
import vue, { Options as VuePluginOptions } from 'rollup-plugin-vue';
import nodeResolve, { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import commonjs, { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import typescript, { RollupTypescriptPluginOptions } from '@rollup/plugin-typescript';
import typescript2, { RPT2Options as RollupTypescript2PluginOptions } from 'rollup-plugin-typescript2';
import json, { RollupJsonOptions } from '@rollup/plugin-json';
import copy, { CopyOptions as RollupCopyPluginOptions } from 'rollup-plugin-copy';
import terser, { Options as RollupTerserPluginOptions } from '@rollup/plugin-terser';
import sourcemaps, { SourcemapsPluginOptions } from 'rollup-plugin-sourcemaps';
import fs from 'fs';
import path from 'path';

type RollupExternalType = string | RegExp | ((id: string) => boolean);

type RollupExternalTypes = RollupExternalType | RollupExternalType[];

type RollupBuildOptions = {
  debug?: boolean;
  output?: RollupOutputOptions;
  outputOverride?: RollupOutputOptions | RollupOutputOptions[];
};

export class CompileConfigBuilder {
  private _debug: boolean | undefined;

  private _libraryName: string | undefined;

  private _pathName: string | undefined;

  private _camelCaseName: string | undefined;

  private _external: RollupExternalTypes | undefined;

  private _pluginBuilder: AbstractPluginBuilder | undefined;

  public static config(debug?: boolean): CompileConfigBuilder {
    const builder = new CompileConfigBuilder();
    builder._debug = debug;
    return builder;
  }

  public prefix(packageJsonName: string, prefix = 'oinone-'): CompileConfigBuilder {
    const libraryName = packageJsonName.replace('@', '').replace('/', '-');
    const pathName = libraryName.substring(prefix.length);
    const camelCaseName = libraryName.replace(/-(\w)/g, (all, letter) => letter.toUpperCase());
    this._libraryName = libraryName;
    this._pathName = pathName;
    this._camelCaseName = camelCaseName;
    return this;
  }

  public get libraryName(): string | undefined {
    return this._libraryName;
  }

  public set libraryName(val: string) {
    this._libraryName = val;
  }

  public setLibraryName(val: string): CompileConfigBuilder {
    this._libraryName = val;
    return this;
  }

  public get pathName(): string | undefined {
    return this._pathName;
  }

  public set pathName(val: string | undefined) {
    this._pathName = val;
  }

  public setPathName(val: string | undefined): CompileConfigBuilder {
    this._pathName = val;
    return this;
  }

  public get camelCaseName(): string | undefined {
    return this._camelCaseName;
  }

  public set camelCaseName(val: string | undefined) {
    this._camelCaseName = val;
  }

  public setCamelCaseName(val: string | undefined): CompileConfigBuilder {
    this._camelCaseName = val;
    return this;
  }

  public get isDebug(): boolean {
    return !!this._debug;
  }

  public external(val: RollupExternalTypes): CompileConfigBuilder {
    if (Array.isArray(val)) {
      this._external = [/node_modules/, ...val];
    } else {
      this._external = [/node_modules/, val];
    }
    return this;
  }

  public singleModule(): RollupSingleModulePluginBuilder {
    this._pluginBuilder = new RollupSingleModulePluginBuilder(this);
    return this._pluginBuilder;
  }

  public multipleModule(): RollupMultipleModulePluginBuilder {
    this._pluginBuilder = new RollupMultipleModulePluginBuilder(this);
    return this._pluginBuilder;
  }

  public build(options?: RollupBuildOptions, plugins?: RollupPlugin[]): RollupOptions {
    const { _libraryName, _external } = this;
    return {
      input: 'index.ts',
      output: options?.outputOverride || [
        {
          file: `dist/${_libraryName}.esm.js`,
          format: 'esm',
          sourcemap: false,
          ...options?.output
        }
      ],
      onwarn(warning) {
        if (warning.code === 'THIS_IS_UNDEFINED' || /Circular/.test(warning.message)) {
          return;
        }
        console.error(warning.message);
      },
      preserveSymlinks: false,
      makeAbsoluteExternalsRelative: 'ifRelativeSource',
      external: _external,
      plugins
    };
  }
}

class AbstractPluginBuilder {
  protected readonly _builder: CompileConfigBuilder;

  protected constructor(builder: CompileConfigBuilder) {
    this._builder = builder;
  }

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

  public get libraryName(): string | undefined {
    return this._builder.libraryName;
  }

  public get pathName(): string | undefined {
    return this._builder.pathName;
  }

  public get camelCaseName(): string | undefined {
    return this._builder.camelCaseName;
  }

  public replace(config: boolean | RollupReplaceOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._replace = val), config, {
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true,
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    });
  }

  public scss(config: boolean | SCSSPluginOptions = true): typeof this {
    const { libraryName } = this._builder;
    return this.$$setPluginOptions((val) => (this._scss = val), config, {
      fileName: `${libraryName}.scss`,
      output: 'dist',
      sourceMap: false,
      outputStyle: 'compressed',
      silenceDeprecations: ['legacy-js-api', 'import']
    });
  }

  public vue(config: boolean | Partial<VuePluginOptions> = true): typeof this {
    return this.$$setPluginOptions((val) => (this._vue = val), config, {});
  }

  public nodeResolve(config: boolean | RollupNodeResolveOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._nodeResolve = val), config, {});
  }

  public commonjs(config: boolean | RollupCommonJSOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._commonjs = val), config, {});
  }

  public typescript(config: boolean | RollupTypescriptPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._typescript = val), config, {});
  }

  public typescript2(config: boolean | RollupTypescript2PluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._typescript2 = val), config, {});
  }

  public json(config: boolean | RollupJsonOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._json = val), config, {});
  }

  public terser(config: boolean | RollupTerserPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._terser = val), config, {});
  }

  public sourcemaps(config: boolean | SourcemapsPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._sourcemaps = val), config, {});
  }

  public copy(config: boolean | RollupCopyPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._copy = val), config, {});
  }

  public copyTypeFiles(typesDir: string, deleteDir: string | string[]): typeof this {
    if (!this._plugins) {
      this._plugins = [];
    }
    const copyPlugin = copy({
      hook: 'writeBundle',
      targets: [
        {
          src: `dist/types/${typesDir}`,
          dest: 'dist/types'
        }
      ]
    });
    const home = process.cwd();
    const deleteDirs = [];
    if (Array.isArray(deleteDir)) {
      deleteDirs.push(...deleteDir.map((v) => path.resolve(home, `dist/types/${v}`)));
    } else {
      deleteDirs.push(path.resolve(home, `dist/types/${deleteDir}`));
    }
    this._plugins.push({
      name: 'copy-and-delete-type-files',
      hook: 'writeBundle',
      writeBundle: async () => {
        await copyPlugin.writeBundle?.();
        for (const dir of deleteDirs) {
          if (fs.existsSync(dir)) {
            if (fs.statSync(dir).isDirectory()) {
              fs.rm(dir, { recursive: true, force: true }, () => {});
            }
          }
        }
      }
    });
    return this;
  }

  public plugins(val: RollupPlugin | RollupPlugin[]) {
    if (!this._plugins) {
      this._plugins = [];
    }
    if (Array.isArray(val)) {
      this._plugins.push(...val);
    } else {
      this._plugins.push(val);
    }
    return this;
  }

  protected $$setPluginOptions<V>(
    setter: (val: V | undefined) => void,
    config: boolean | V,
    defaultConfig: V
  ): typeof this {
    setter = setter.bind(this);
    if (typeof config === 'boolean') {
      if (config) {
        setter({ ...defaultConfig });
      } else {
        setter(undefined);
      }
    } else {
      setter({
        ...defaultConfig,
        ...config
      } as V);
    }
    return this;
  }

  public build(options?: RollupBuildOptions) {
    return this._builder.build(options, this.buildPlugins());
  }

  protected defaultTypescriptCompilerOptions = {
    outDir: 'dist',
    declaration: true,
    declarationDir: 'dist/types',
    moduleResolution: 'Bundler',
    incremental: false,
    sourceMap: false,
    verbatimModuleSyntax: false,
    isolatedModules: false,
    stripInternal: false
  };

  private buildPlugins(): RollupPlugin[] {
    const {
      _replace,
      _scss,
      _vue,
      _nodeResolve,
      _commonjs,
      _typescript,
      _typescript2,
      _json,
      _copy,
      _terser,
      _sourcemaps,
      _plugins
    } = this;
    const plugins: RollupPlugin[] = [];
    if (_replace) {
      plugins.push(replace(_replace));
    }
    if (_scss) {
      plugins.push(scss(_scss));
    }
    if (_vue) {
      plugins.push(vue(_vue));
    }
    if (_nodeResolve) {
      plugins.push(nodeResolve(_nodeResolve));
    }
    if (_commonjs) {
      plugins.push(commonjs(_commonjs));
    }
    if (_typescript2) {
      plugins.push(typescript2(_typescript2));
    } else if (_typescript) {
      plugins.push(typescript(_typescript));
    }
    if (_json) {
      plugins.push(json(_json));
    }
    if (_terser) {
      plugins.push(terser(_terser));
    }
    if (_sourcemaps) {
      plugins.push(sourcemaps(_sourcemaps));
    }
    if (_copy) {
      plugins.push(copy(_copy));
    }
    if (_plugins) {
      plugins.push(..._plugins);
    }
    return plugins;
  }
}

class RollupSingleModulePluginBuilder extends AbstractPluginBuilder {
  public constructor(builder: CompileConfigBuilder) {
    super(builder);
  }

  public typescript(val: boolean | RollupTypescriptPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._typescript = val), val, {
      compilerOptions: {
        ...this.defaultTypescriptCompilerOptions
      },
      include: ['index.ts', 'src/**/*.ts'],
      exclude: ['**/__tests__/**/*.ts']
    });
  }

  public typescript2(val: boolean | RollupTypescript2PluginOptions = true): typeof this {
    let extraOptions: RollupTypescript2PluginOptions = {};
    if (this._builder.isDebug) {
      extraOptions = {
        clean: true,
        abortOnError: false
      };
    }
    return this.$$setPluginOptions((val) => (this._typescript2 = val), val, {
      useTsconfigDeclarationDir: true,
      ...extraOptions,
      tsconfigOverride: {
        compilerOptions: {
          ...this.defaultTypescriptCompilerOptions
        },
        include: ['index.ts', 'src/**/*.ts'],
        exclude: ['**/node_modules/**/*', '**/__tests__/**/*']
      },
      include: ['index.ts', 'src/**/*.ts'],
      exclude: ['**/node_modules/**/*', '**/__tests__/**/*']
    });
  }
}

class RollupMultipleModulePluginBuilder extends AbstractPluginBuilder {
  public constructor(builder: CompileConfigBuilder) {
    super(builder);
  }

  public typescript(config: boolean | RollupTypescriptPluginOptions = true): typeof this {
    return this.$$setPluginOptions((val) => (this._typescript = val), config, {
      tsconfig: '../../tsconfig.json',
      compilerOptions: {
        ...this.defaultTypescriptCompilerOptions
      },
      include: ['index.ts', 'src/**/*.ts'],
      exclude: ['node_modules', '**/__tests__/**/*.ts']
    });
  }

  public typescript2(config: boolean | RollupTypescript2PluginOptions = true): typeof this {
    const home = path.resolve(process.cwd(), '../../');
    const basePath = `packages/${this._builder.pathName}`;
    let extraOptions: RollupTypescript2PluginOptions = {};
    if (this._builder.isDebug) {
      extraOptions = {
        clean: true,
        abortOnError: false
      };
    }
    return this.$$setPluginOptions((val) => (this._typescript2 = val), config, {
      cwd: home,
      useTsconfigDeclarationDir: true,
      ...extraOptions,
      tsconfigOverride: {
        compilerOptions: {
          ...this.defaultTypescriptCompilerOptions,
          outDir: `${basePath}/dist`,
          declarationDir: `${basePath}/dist/types`
        },
        include: [`${basePath}/index.ts`, `${basePath}/src/**/*.ts`],
        exclude: ['**/node_modules/**/*', '**/__tests__/**/*']
      },
      include: ['index.ts', 'src/**/*.ts'],
      exclude: ['**/node_modules/**/*', '**/__tests__/**/*']
    });
  }
}

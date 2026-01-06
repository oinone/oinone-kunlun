interface JestConfigBuilderOptions {
    tsconfig?: string;
    moduleNameMapper?: Record<string, string>;
    globals?: Record<string, unknown>;
    setupFiles?: string[];
    testEnvironment?: string;
    testEnvironmentOptions?: Record<string, unknown>;
}
export declare const buildConfig: (options?: JestConfigBuilderOptions) => {
    testMatch: string[];
    transform: {
        '^.+\\.(j|t)sx?$': (string | {
            tsconfig: string;
            diagnostics: {
                warnOnly: boolean;
            };
            useESM: boolean;
        })[];
    };
    moduleNameMapper: {
        'lodash-es': string;
    };
    globals: {
        window: {};
    };
    setupFiles: string[];
};
export {};

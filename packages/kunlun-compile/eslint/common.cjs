const common = {
  name: 'oinone/common-rules',
  files: ['**/*.{ts,mts,tsx,vue}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-duplicate-enum-values': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-rest-params': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/multi-word-component-names': 'warn',
    'vue/block-lang': 'warn',
    'vue/no-reserved-component-names': 'warn',
    'vue/no-unused-vars': 'warn',
    'vue/require-v-for-key': 'warn',
    'vue/valid-next-tick': 'warn',
    'vue/valid-v-for': 'warn',
    'vue/valid-v-on': 'warn',

    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    'vue/no-dupe-keys': 'off',
    'vue/no-mutating-props': 'off',
    'vue/prefer-import-from-vue': 'off'
  }
};

export default common;

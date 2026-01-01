const common = {
  name: 'oinone/common-rules',
  files: ['**/*.{ts,mts,tsx,vue}'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'prefer-rest-params': 'warn',
    'vue/no-unused-components': 'warn',
    'vue/multi-word-component-names': 'warn',
    'vue/block-lang': 'warn',
    'vue/no-unused-vars': 'warn',

    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-wrapper-object-types': 'off',
    'vue/no-dupe-keys': 'off'
  }
};

export default common;

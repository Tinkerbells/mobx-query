module.exports = {
  'package/**/*.{js,jsx,ts,tsx}': [
    'npm run lint --workspace=@tinkerbells88/mobx-query',
    () => 'npm run lint:types --workspace=@tinkerbells88/mobx-query',
  ],
};

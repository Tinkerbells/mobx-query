module.exports = {
  'package/**/*.{js,jsx,ts,tsx}': [
    'npm run lint --workspace=@tinkerbells/mobx-query',
    () => 'npm run lint:types --workspace=@tinkerbells/mobx-query',
  ],
};

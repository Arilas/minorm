module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['packages/**/src/**/*.ts'],
  coverageDirectory: './coverage/',
  collectCoverage: true,
  testPathIgnorePatterns: [
    '<rootDir>[/\\\\](build|docs|node_modules|scripts|lib)[/\\\\]',
    '(config|fixtures)',
  ],
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.js$'],
  moduleFileExtensions: ['ts', 'js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  modulePathIgnorePatterns: ['lib'],
  moduleNameMapper: {
    '@minorm/(.+)$': '<rootDir>packages/$1/src',
  },
}

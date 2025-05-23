const base = require('../jest.config');

module.exports = {
  ...base,
  testMatch: ['<rootDir>/test/unit/**/*.(spec|test).(js|ts)'],

  coverageDirectory: '../../.coverage/unit',
  collectCoverageFrom: ['src/**'],
  collectCoverage: false,
  coverageReporters: [
    [
      'json',
      {
        file: 'unit-coverage.json',
      },
    ],
  ],
};
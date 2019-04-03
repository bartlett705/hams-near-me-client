module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.tsx'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/__mocks__/fileMock.js',
    '\\.(s?css)$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['./test/setup.ts']
}

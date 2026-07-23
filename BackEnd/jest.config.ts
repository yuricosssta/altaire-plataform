import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: './',
  testRegex: '.*\\.spec\\.ts$', // Testa apenas arquivos que terminam com .spec.ts
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', // Usa ts-jest para transformar arquivos TypeScript
  },
  collectCoverageFrom: ['**/*.(t|j)s'], // Inclui todos os arquivos .ts e .js para cobertura
  coverageDirectory: './coverage', // Gera relatório de cobertura em ./coverage
  testEnvironment: 'node', // Define o ambiente de teste
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths || {}, {
    prefix: '<rootDir>/',
  }), // Mapeia os aliases do tsconfig.json
};

export default config;

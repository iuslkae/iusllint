#!/usr/bin/env node
import * as yargs from 'yargs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { copyFileSync, accessSync, PathLike, readFileSync, read } from 'fs';
import { join } from 'path';
import { PackageJson } from 'type-fest';
const asyncExec = promisify(exec);
const exists = (path: PathLike): boolean => {
  try {
    accessSync(path);
    console.log(`path: ${path} exists, ignoring default lint file copy`);
    return true;
  } catch {
    return false;
  }
};
enum LintFiles {
  eslintrc = '.eslintrc',
  prettierrc = '.prettierrc',
  tsconfig = 'tsconfig.json',
}
const command = `yarn add -D eslint eslint-config-prettier eslint-plugin-prettier prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin -E`;
const tCommand = `yarn add -D typescript ttypescript ts-node nodemon ts-transformer-keys @types/node -E`;
const start = `nodemon --watch \"src/**\" --ext \"ts,json,env\" --ignore \"src/**/*.spec.ts\" --exec \"ts-node src/index.ts\"`;
const main = 'src/index.ts';

const genFile = (file: LintFiles): void => {
  if (!exists(join(process.cwd(), file))) {
    try {
      copyFileSync(
        require.resolve(`iusllint/lintfiles/${file}`),
        join(process.cwd(), file),
      );
    } catch (e) {
      console.log(e);
    }
  }
};

const argv = yargs.command(
  '$0',
  'the default command',
  (yargs) => {
    return yargs.options({
      t: {
        alias: 'typescript',
        describe: 'generate aditional standard tsconfig.json',
        type: 'boolean',
      },
      ts: {
        alias: 'tsdev',
        describe:
          'generate aditional standard tsconfig.json and installs basic typescript dev env',
        type: 'boolean',
      },
      tsc: {
        alias: 'tsdevfull',
        describe:
          'generate aditional standard tsconfig.json and installs basic typescript dev env and sets pkg.json.start',
        type: 'boolean',
      },
    });
  },
  async (argv) => {
    console.log(command);
    await asyncExec(command).then(console.log).catch(console.log);
    genFile(LintFiles.eslintrc);
    genFile(LintFiles.prettierrc);
    if (argv.t) {
      genFile(LintFiles.tsconfig);
    }
    if (argv.ts) {
      genFile(LintFiles.tsconfig);
      console.log(tCommand);
      await asyncExec(tCommand).then(console.log).catch(console.log);
    }
    if (argv.tsc) {
      genFile(LintFiles.tsconfig);
      console.log(tCommand);
      await asyncExec(tCommand).then(console.log).catch(console.log);
      if (exists(join(process.cwd(), 'package.json'))) {
        const rawJson = readFileSync('package.json', 'utf-8');
        const pkgJson: PackageJson = JSON.parse(rawJson);
        pkgJson.scripts.start = start;
        pkgJson.main = 'src/index.ts';
      }
    }
  },
).argv;

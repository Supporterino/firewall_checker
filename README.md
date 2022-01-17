# TypeScript_Boilerplate

This is a basic node.js setup with TypeScript as the language. The boilerplate also includes eslint and a setup for nodemon to watch changes.

## Usage

### Build
```bash
npm run build
```
This command purges the `build` directory and compiles the sourcecode in the `src` directory.

### Run
```bash
npm run start
```
This command runs the above build command and then executes the resulting JavaScript code with node.

### Run (dev)
```bash
npm run start:dev
```
Starts a nodemon instance which reexecutes the project on changes in the `src` directory.

### Lint
```bash
npm run lint
```
Runs eslint on the `src` directory.

### Lint & fix
```bash
npm run lint-and-fix
```
Runs eslint on the `src` directory and fixes the stuff eslint can do.
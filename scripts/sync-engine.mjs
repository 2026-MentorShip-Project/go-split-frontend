// Next serves WebAssembly from public/, so the engine binary is copied out of
// node_modules on every dev/build run instead of being committed. That keeps it
// in lockstep with the installed @go-split/engine version.
import { copyFile, mkdir } from 'node:fs/promises';

const source = new URL('../node_modules/@go-split/engine/dist/engine.wasm', import.meta.url);
const target = new URL('../public/engine.wasm', import.meta.url);

await mkdir(new URL('../public/', import.meta.url), { recursive: true });
await copyFile(source, target);

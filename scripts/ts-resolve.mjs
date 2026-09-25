// Node's ESM resolver requires explicit file extensions; TypeScript sources use
// extensionless relative imports because a bundler normally resolves them. This
// hook closes that gap so `node --experimental-strip-types` can run the repo's
// .ts modules directly, with no bundler and no build step.
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (error) {
    if (specifier.startsWith(".") && context.parentURL) {
      for (const extension of [".ts", ".tsx", "/index.ts"]) {
        const candidate = new URL(specifier + extension, context.parentURL);
        if (existsSync(fileURLToPath(candidate))) {
          return next(specifier + extension, context);
        }
      }
    }
    throw error;
  }
}

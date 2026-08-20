# backend

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## API docs (Swagger / OpenAPI)

The API is documented in [`swagger.yaml`](./swagger.yaml) (OpenAPI 3.0). To view it as an interactive docs page:

```bash
bun run docs:serve
```

Then open [http://localhost:8090/swagger.html](http://localhost:8090/swagger.html) in your browser.

This builds a static docs page (`swagger.html`) from `swagger.yaml` and serves it locally. To just regenerate `swagger.html` without serving it, run `bun run docs:build` — the file is self-contained, so you can also open it directly from the filesystem without a server.

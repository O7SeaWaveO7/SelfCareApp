#### Fix to solve for empty getenv folder

```bash
bun pm cache rm
Remove-Item -Recurse -Force node_modules
Remove-Item -Force bun.lock
Remove-Item -Recurse -Force .expo
```

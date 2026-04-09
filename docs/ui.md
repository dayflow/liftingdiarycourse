# UI Coding Standards

## Component Library

**Only shadcn/ui components are permitted in this project.** Do not create custom UI components.

- Install components via `npx shadcn@latest add <component>`
- Import from `@/components/ui/<component>`
- Configure and theme via `components.json` and CSS variables in `globals.css`

If a UI need cannot be met by an existing shadcn/ui component, compose multiple shadcn/ui components together rather than building something custom.

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/). No other date libraries or manual formatting.

Dates must be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

Use the `do MMM yyyy` format token:

```ts
import { format } from 'date-fns'

format(date, 'do MMM yyyy')
// => "1st Sep 2025"
```

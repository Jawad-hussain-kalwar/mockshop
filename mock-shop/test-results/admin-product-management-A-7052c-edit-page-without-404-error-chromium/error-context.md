# Page snapshot

```yaml
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- img
- text: Next.js 15.4.6 Turbopack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - link "Go to related documentation":
    - /url: https://nextjs.org/docs/messages/module-not-found
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Module not found: Can't resolve '@radix-ui/react-switch'"
  - img
  - text: ./src/components/ui/switch.tsx (4:1)
  - button "Open in editor":
    - img
  - text: "Module not found: Can't resolve '@radix-ui/react-switch' 2 | 3 | import * as React from \"react\" > 4 | import * as SwitchPrimitives from \"@radix-ui/react-switch\" | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 5 | 6 | import { cn } from \"@/lib/utils\" 7 | Import traces: Client Component Browser: ./src/components/ui/switch.tsx [Client Component Browser] ./src/app/admin/products/[id]/edit/page.tsx [Client Component Browser] ./src/app/admin/products/[id]/edit/page.tsx [Server Component] Client Component SSR: ./src/components/ui/switch.tsx [Client Component SSR] ./src/app/admin/products/[id]/edit/page.tsx [Client Component SSR] ./src/app/admin/products/[id]/edit/page.tsx [Server Component]"
  - link "https://nextjs.org/docs/messages/module-not-found":
    - /url: https://nextjs.org/docs/messages/module-not-found
- alert
```
<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules (Canteeno)

- All app data lives in one zustand store (`src/store/app-store.ts`, persisted to localStorage, hydrated after mount in `__root.tsx`); store actions are the seam to swap for API calls later — keep pages calling actions, not mutating data directly.
- Business rules (cart totals, add-to-cart checks, order status flow, prep estimate, order numbers) live as pure functions in `src/lib/order-logic.ts` with tests beside them; change rules there, not in components.
- Zustand selectors must return existing references or primitives — never `.filter`/`.map` inside `useApp(selector)` (causes infinite re-render); derive after selecting.
- Student pages sit under the pathless `_student` layout (header/footer); `/staff/*` and `/admin/*` use `DashboardShell` behind a demo `RoleGate`.
- Render dates only through `TimeText` (client-only) to avoid server/browser time-zone hydration mismatches.

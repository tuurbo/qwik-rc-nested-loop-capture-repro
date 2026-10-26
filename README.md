# Production build hoists a nested `.map()` handler's captures out of the loops → page fails to render

1. `pnpm install && pnpm preview` (production build only; with `pnpm dev` the page works)
2. Open the preview URL. Instead of the checkboxes you get Qwik's "500 Internal Server Error" page, served with HTTP status 200. The server keeps running and logs nothing.

`src/routes/index.tsx` has a handler that captures both loop variables:

```tsx
{props.facets.map((facet) => (
  <div key={facet.slug}>
    {facet.items.map((item) => (
      <label key={item.slug}>
        <input type="checkbox" onChange$={() => props.toggle$(facet.slug, item.slug)} />
```

The build puts the handler's capture array at component scope, before either loop runs:

```js
// server/build/q-*.js
c.s(e=>{let t=s.w([facet,e]);return a(`div`,null,null,e.facets.map(e=>a(`div`,null,null,e.items.map(n=> ...
```

`facet` isn't defined there, so rendering throws a `ReferenceError`. To see it: `grep -o "w(\[facet[^)]*)" server/build/*.js`.

Workaround: pass the loop values through `data-*` and read them from the element:

```tsx
<input
  type="checkbox"
  data-facet={facet.slug}
  data-item={item.slug}
  onChange$={(_, el) => props.toggle$(el.dataset.facet!, el.dataset.item!)}
/>
```

Version: 2.0.0-rc.4 (first reported on 2.0.0-rc.2). [#9231](https://github.com/QwikDev/qwik/pull/9231) in rc.4 fixed this for components with a block body. `Facets` here returns its JSX directly (`(props) => (...)`), which still fails. Changing only the body to `(props) => { return (...); }` builds `w([t,e])` and works.

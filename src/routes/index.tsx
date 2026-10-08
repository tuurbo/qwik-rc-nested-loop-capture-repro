import { $, component$, useSignal, type QRL } from "@qwik.dev/core";

type Facet = { slug: string; items: { slug: string }[] };

const facets: Facet[] = [
  { slug: "color", items: [{ slug: "red" }, { slug: "blue" }] },
  { slug: "size", items: [{ slug: "small" }, { slug: "large" }] },
];

const Facets = component$<{ facets: Facet[]; toggle$: QRL<(facet: string, item: string) => void> }>(
  (props) => (
    <div>
      {props.facets.map((facet) => (
        <div key={facet.slug}>
          {facet.items.map((item) => (
            <label key={item.slug}>
              <input type="checkbox" onChange$={() => props.toggle$(facet.slug, item.slug)} />
              {facet.slug}: {item.slug}
            </label>
          ))}
        </div>
      ))}
    </div>
  ),
);

export default component$(() => {
  const last = useSignal("");

  return (
    <>
      <Facets facets={facets} toggle$={$((facet, item) => (last.value = `${facet}=${item}`))} />
      <p>Last toggled: {last.value}</p>
    </>
  );
});

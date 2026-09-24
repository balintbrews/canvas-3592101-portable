import { cn, sortMenu } from 'drupal-canvas';
import { useSiteContext, useJsonApiClient } from 'drupal-canvas/react';
import useSWR from 'swr';

function renderMenu(items) {
  return (
    <ul className="space-y-2 pl-4">
      {items.map((item) => (
        <li key={item.id}>
          <a className="underline focus-visible:outline-2" href={item.url}>
            {item.title}
          </a>
          {item._children.length > 0 && renderMenu(item._children)}
        </li>
      ))}
    </ul>
  );
}

export default function PageFrame({ menuName, content, className }) {
  const site = useSiteContext();
  const client = useJsonApiClient();
  const clientReady = Boolean(client);
  const { data, error, isLoading } = useSWR(
    menuName && client ? [client, 'menu_items', menuName] : null,
    ([activeClient, type, id]) => activeClient.getResource(type, id),
  );
  const validMenu =
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.url === 'string',
    );

  return (
    <section
      className={cn(
        'mx-auto max-w-3xl space-y-8 p-6 font-sans text-gray-900',
        className,
      )}
    >
      <header className="space-y-4 border-b border-gray-300 pb-6">
        <h1 className="text-2xl font-bold">
          {site?.branding.siteName || 'Site name unavailable'}
        </h1>
        <dl className="space-y-1 break-words">
          <dt className="font-semibold">Site URL</dt>
          <dd>{site?.baseUrl || 'Unavailable'}</dd>
          <dt className="font-semibold">Site slogan</dt>
          <dd>{site?.branding.siteSlogan || 'Not supplied'}</dd>
          <dt className="font-semibold">Theme logo URL</dt>
          <dd>{site?.themeAssets.logo.url || 'Not supplied'}</dd>
        </dl>
        <nav aria-label="Site menu">
          {!menuName ? (
            <p>Configure a menu ID to request live menu items.</p>
          ) : !clientReady ? (
            <p>JSON:API client unavailable.</p>
          ) : error ? (
            <p role="alert">
              Menu request failed. Check the menu ID and JSON:API menu endpoint.
            </p>
          ) : isLoading ? (
            <p role="status">Loading menu…</p>
          ) : data !== undefined && !validMenu ? (
            <p role="alert">
              Unexpected menu response; expected deserialized menu items.
            </p>
          ) : validMenu && data.length ? (
            renderMenu(sortMenu(data))
          ) : (
            <p>No menu items returned.</p>
          )}
        </nav>
      </header>
      <div className="min-h-24">{content}</div>
    </section>
  );
}

import { cn, FormattedText, getNodePath, Image } from 'drupal-canvas';
import { usePageContext, useJsonApiClient } from 'drupal-canvas/react';
import { DrupalJsonApiParams } from 'drupal-jsonapi-params';
import useSWR from 'swr';

export default function ArticleList({ resourceType, image, className }) {
  const page = usePageContext();
  const client = useJsonApiClient();
  const configured = /^node--[a-z][a-z0-9_]*$/.test(resourceType || '');
  const queryString = new DrupalJsonApiParams()
    .addFields(resourceType, [
      'title',
      'created',
      'body',
      'path',
      'drupal_internal__nid',
    ])
    .addSort('created', 'DESC')
    .addPageLimit(3)
    .getQueryString();
  const { data, error, isLoading } = useSWR(
    configured && client ? [client, resourceType, queryString] : null,
    ([activeClient, type, query]) =>
      activeClient.getCollection(type, { queryString: query }),
  );
  const validArticles =
    Array.isArray(data) &&
    data.every(
      (item) =>
        item &&
        typeof item.id === 'string' &&
        typeof item.title === 'string' &&
        typeof item.created === 'string' &&
        item.body &&
        typeof item.body.processed === 'string' &&
        getNodePath(item) !== '#',
    );

  return (
    <section className={cn('space-y-4', className)}>
      <h2 className="text-xl font-semibold">Articles</h2>
      <dl className="space-y-1 break-words">
        <dt className="font-semibold">Current page title</dt>
        <dd>{page?.pageTitle || 'Unavailable'}</dd>
        <dt className="font-semibold">Current entity UUID</dt>
        <dd>{page?.mainEntity?.uuid || 'No primary entity supplied'}</dd>
      </dl>
      {image?.src && (
        <Image
          {...image}
          alt={image.alt}
          className="h-auto max-w-full rounded"
        />
      )}
      {!configured ? (
        <p>
          Configure the node JSON:API resource type containing title, created,
          body, and path fields.
        </p>
      ) : !client ? (
        <p>JSON:API client unavailable.</p>
      ) : error ? (
        <p role="alert">
          Article request failed. Check the resource type, fields, and access.
        </p>
      ) : isLoading ? (
        <p role="status">Loading articles…</p>
      ) : data !== undefined && !validArticles ? (
        <p role="alert">
          Unexpected article response; expected deserialized title, date, body,
          and node path.
        </p>
      ) : validArticles && data.length ? (
        <ul className="space-y-6">
          {data.map((article) => (
            <li
              key={article.id}
              className="space-y-2 border-t border-gray-300 pt-4"
            >
              <h3 className="text-lg font-semibold">
                <a
                  className="underline focus-visible:outline-2"
                  href={getNodePath(article)}
                >
                  {article.title}
                </a>
              </h3>
              <time dateTime={article.created}>{article.created}</time>
              <FormattedText>{article.body.processed}</FormattedText>
            </li>
          ))}
        </ul>
      ) : (
        <p>No articles returned.</p>
      )}
    </section>
  );
}

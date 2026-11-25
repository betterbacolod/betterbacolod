import { pageStructuredData, siteMetadata } from '../../../data/siteMetadata';
import { type BudgetSnapshot, DATA_PATH, DBM_NEP } from './data';

export const departmentBudgetsMetadata = {
  title: '2027 Department Budgets: Bacolod & NIR',
  description:
    'Explore proposed 2027 DepEd, DOH, and DSWD funding. Find Bacolod division and NIR entries, compare budget proposals, and check source documents.',
  url: '/transparency/department-budgets',
};

export function departmentBudgetsStructuredData(
  snapshot?: BudgetSnapshot | null,
) {
  const meta = departmentBudgetsMetadata;
  const pages: Record<string, unknown>[] = pageStructuredData(
    meta.url,
    meta.title,
    meta.description,
  );
  if (snapshot)
    pages.push({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': `${siteMetadata.url}${meta.url}#dataset`,
      name: 'FY2027 DepEd, DOH and DSWD proposal comparison: NIR and Bacolod division entries',
      description:
        'Saved, machine-extracted comparison under citizen review: Executive NEP new appropriations versus House Bill 10858 third reading. Bacolod entries are DepEd division records; DOH and DSWD amounts identify NIR, not a city allocation. School breakdowns are included in parent totals. Proposed funding, not actual spending.',
      url: `${siteMetadata.url}${meta.url}`,
      dateModified: snapshot.builtAt,
      temporalCoverage: '2027',
      spatialCoverage: {
        '@type': 'Place',
        name: 'Negros Island Region, Philippines',
      },
      creator: {
        '@type': 'Organization',
        name: 'BetterGov',
        url: 'https://budget.bettergov.ph',
      },
      publisher: { '@id': `${siteMetadata.url}/#organization` },
      isBasedOn: snapshot.sources.map((source) => source.url),
      citation: [DBM_NEP, 'https://budget.bettergov.ph/hgab/2027/sources'],
      variableMeasured: [
        'NEP new appropriations (PHP)',
        'House third-reading new appropriations (PHP)',
      ],
      distribution: {
        '@type': 'DataDownload',
        encodingFormat: 'application/json',
        contentUrl: `${siteMetadata.url}${DATA_PATH}`,
      },
    });
  return pages;
}

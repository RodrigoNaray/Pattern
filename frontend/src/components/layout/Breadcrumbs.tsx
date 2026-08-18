import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  const baseUrl =
    import.meta.env.VITE_BASE_URL ??
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
      <ol className={styles.lista}>
        {items.map((item, index) => {
          const esUltimo = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className={styles.item}>
              {item.href && !esUltimo ? (
                <Link to={item.href} className={styles.enlace}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.actual} aria-current="page">
                  {item.label}
                </span>
              )}
              {!esUltimo && (
                <span className={styles.separador} aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </nav>
  );
}

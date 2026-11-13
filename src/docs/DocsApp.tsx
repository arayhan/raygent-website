import { useEffect, useState } from 'react';
import docs from 'virtual:raygent-docs';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LanguageProvider, useLanguage } from '../i18n/LanguageProvider';
import { LINKS } from '../content/links';
import { orderedSlugs } from './order';

const FALLBACK = 'overview';

function readSlug(): string {
  return decodeURIComponent(window.location.hash.slice(1));
}

function DocsPage() {
  const { lang, t } = useLanguage();
  const pages = docs[lang];
  const slugs = orderedSlugs(Object.keys(pages));
  const [hash, setHash] = useState(readSlug);
  const slug = hash in pages ? hash : FALLBACK;
  const page = pages[slug] ?? pages[slugs[0]];

  useEffect(() => {
    const onHash = () => {
      setHash(readSlug());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = `${page.title} · ${t.docsPage.title}`;
  }, [lang, page.title, t]);

  return (
    <>
      {/* The hash picks the guide, so the skip link focuses the article instead of navigating. */}
      <a
        href={`#${slug}`}
        className="btn btn-primary skip-link"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('guide')?.focus();
        }}
      >
        {t.ui.skip}
      </a>
      <Header home="../" />
      <main className="page-x relative z-10">
        <div className="mx-auto grid max-w-(--container-page) gap-10 py-12 grid-cols-[minmax(0,1fr)] md:grid-cols-[200px_minmax(0,1fr)] md:gap-16 md:py-16">
          <nav aria-label={t.docsPage.navLabel} className="min-w-0">
            <label className="grid gap-2 md:hidden">
              <span className="label">{t.docsPage.guides}</span>
              <select
                className="docs-select"
                value={slug}
                onChange={(e) => {
                  window.location.hash = e.target.value;
                }}
              >
                {slugs.map((s) => (
                  <option key={s} value={s}>
                    {pages[s].title}
                  </option>
                ))}
              </select>
            </label>
            <div className="sticky hidden md:grid md:gap-3" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 96px)' }}>
              <p className="label m-0">{t.docsPage.guides}</p>
              <ul className="m-0 grid list-none gap-1 p-0">
                {slugs.map((s) => (
                  <li key={s}>
                    <a href={`#${s}`} className="docs-nav-link" aria-current={s === slug ? 'page' : undefined}>
                      {pages[s].title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-10">
            <article id="guide" tabIndex={-1} className="doc-prose outline-none" dangerouslySetInnerHTML={{ __html: page.html }} />
            <p className="m-0 border-t border-hairline-soft pt-6">
              <a
                href={`${LINKS.repo}/blob/main/docs/${lang}/${slug}.md`}
                className="link-sweep text-small"
                target="_blank"
                rel="noreferrer"
              >
                {t.docsPage.edit}
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function DocsApp() {
  return (
    <LanguageProvider manageMeta={false}>
      <DocsPage />
    </LanguageProvider>
  );
}

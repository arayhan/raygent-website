declare module 'virtual:raygent-docs' {
  /** Rendered guides by language, then slug. Built by the raygentDocs plugin in vite.config.ts. */
  const docs: Record<'en' | 'id', Record<string, { title: string; html: string }>>;
  export default docs;
}

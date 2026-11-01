import { docs, type DocEntry } from "../data/docs";

export type SearchResult = {
  slug: string;
  hash?: string;
  title: string;
  context: string;
  kind: "页面" | "小节";
  score: number;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function searchDocs(rawQuery: string): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) {
    return docs.slice(0, 5).map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      context: `第 ${doc.chapter} 章 · ${doc.group}`,
      kind: "页面" as const,
      score: 0,
    }));
  }

  const results: SearchResult[] = [];

  for (const doc of docs) {
    let pageScore = 0;
    if (normalize(doc.title).includes(query)) pageScore += 100;
    if (normalize(doc.navTitle).includes(query)) pageScore += 40;
    if (doc.keywords.some((keyword) => normalize(keyword).includes(query))) pageScore += 60;
    if (normalize(doc.summary).includes(query)) pageScore += 24;

    if (pageScore > 0) {
      results.push({
        slug: doc.slug,
        title: doc.title,
        context: `第 ${doc.chapter} 章 · ${doc.summary}`,
        kind: "页面",
        score: pageScore,
      });
    }

    for (const heading of doc.headings) {
      if (!normalize(heading.text).includes(query)) continue;
      results.push({
        slug: doc.slug,
        hash: heading.id,
        title: heading.text,
        context: `${doc.title} · 第 ${doc.chapter} 章`,
        kind: "小节",
        score: 50 + (heading.depth === 2 ? 8 : 0) + (pageScore > 0 ? 6 : 0),
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 12);
}

export function firstResult(query: string): SearchResult | undefined {
  return searchDocs(query)[0];
}

export type { DocEntry };

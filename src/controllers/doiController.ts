import { Request, Response } from 'express';

export interface CrossRefAuthor {
  name?: string;
  given?: string;
  family?: string;
  sequence: string;
  affiliation: { name: string }[];
}

export interface CrossRefWork {
  DOI: string;
  title: string[];
  author: CrossRefAuthor[];
  'container-title': string[];
  type: string;
  published: { 'date-parts': number[][] };
  URL: string;
  abstract?: string;
  'published-online'?: { 'date-parts': number[][] };
}

export interface DOIMetadata {
  doi: string;
  title: string;
  authors: string[];
  publicationPlace: string;
  type: string;
  year: number | null;
  url: string;
  abstract: string | null;
  source: 'crossref';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function formatAuthor(author: CrossRefAuthor): string {
  if (author.name) return author.name;
  if (author.given && author.family) return `${author.given} ${author.family}`;
  if (author.family) return author.family;
  if (author.given) return author.given;
  return '';
}

async function fetchFromCrossRef(doi: string): Promise<DOIMetadata | null> {
  const cleanDoi = doi.trim().replace(/^https?:\/\/doi\.org\//, '');

  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`, {
    headers: {
      'User-Agent': `MermasAcervo/1.0 (mailto:contato@mermasdigitais.com.br)`,
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  const work: CrossRefWork = data.message;

  const title = Array.isArray(work.title) ? work.title[0] : work.title || '';
  const containerTitle = Array.isArray(work['container-title'])
    ? work['container-title'][0]
    : work['container-title'] || '';

  const authors = (work.author || [])
    .map(formatAuthor)
    .filter(Boolean);

  const year =
    work.published?.['date-parts']?.[0]?.[0] ||
    work['published-online']?.['date-parts']?.[0]?.[0] ||
    null;

  const abstract = work.abstract ? stripHtml(work.abstract) : null;

  return {
    doi: work.DOI || cleanDoi,
    title,
    authors,
    publicationPlace: containerTitle,
    type: work.type || 'journal-article',
    year,
    url: work.URL || `https://doi.org/${cleanDoi}`,
    abstract,
    source: 'crossref',
  };
}

export const doiController = {
  lookupByDoi: async (req: Request, res: Response) => {
    try {
      const doi = req.query.doi as string;

      if (!doi) {
        return res.status(400).json({ message: 'Parâmetro "doi" é obrigatório. Exemplo: ?doi=10.1038/nature12373' });
      }

      const metadata = await fetchFromCrossRef(doi);

      if (!metadata) {
        return res.status(404).json({
          message: `Nenhum artigo encontrado para o DOI: ${doi}`,
        });
      }

      return res.json(metadata);
    } catch (error: any) {
      console.error('Erro ao buscar DOI:', error);
      return res.status(500).json({
        message: error.message || 'Erro ao consultar API externa de DOI',
      });
    }
  },
};

export default doiController;

import { Request, Response } from 'express';
import { parse } from 'csv-parse/sync';
import { db } from '../db';
import { acervo, acervoTypes, AcervoType } from '../db/schema';
import { AuthenticatedRequest } from '../routers/middleware';

const REQUIRED_COLUMNS = ['title', 'type'];
const VALID_COLUMNS = [
  'title', 'type', 'description', 'subType', 'publicationPlace',
  'publicationYear', 'doi', 'authors', 'externalUrl',
];

function parseAuthors(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw.split(',').map((a) => a.trim()).filter(Boolean);
}

function validateRow(row: any, rowNum: number): string[] {
  const errors: string[] = [];

  if (!row.title || !row.title.trim()) {
    errors.push('Título obrigatório ausente');
  }

  if (!row.type || !row.type.trim()) {
    errors.push('Tipo obrigatório ausente');
  } else if (!acervoTypes.includes(row.type.trim() as AcervoType)) {
    errors.push(`Tipo inválido: "${row.type}". Use: ${acervoTypes.join(', ')}`);
  }

  return errors;
}

export const acervoImportController = {
  importCsv: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = (req.files as Express.Multer.File[])?.[0];

      if (!file) {
        return res.status(400).json({ message: 'Arquivo CSV não enviado' });
      }

      if (!file.originalname.endsWith('.csv')) {
        return res.status(400).json({ message: 'Tipo de arquivo inválido. Envie um arquivo .csv' });
      }

      let records: any[];
      try {
        records = parse(file.buffer.toString('utf-8'), {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
          relax_column_count: true,
        });
      } catch (parseError: any) {
        return res.status(400).json({
          message: 'Erro ao ler CSV. Verifique o formato do arquivo.',
          error: parseError.message,
        });
      }

      if (records.length === 0) {
        return res.status(400).json({ message: 'CSV vazio ou sem dados' });
      }

      const firstRecord = records[0];
      const csvColumns = Object.keys(firstRecord);
      const unknownColumns = csvColumns.filter((col) => !VALID_COLUMNS.includes(col));

      if (unknownColumns.length > 0) {
        return res.status(400).json({
          message: `Colunas inválidas no CSV: ${unknownColumns.join(', ')}. Colunas válidas: ${VALID_COLUMNS.join(', ')}`,
        });
      }

      const allErrors: { row: number; message: string }[] = [];
      const rowsToInsert: any[] = [];

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNum = i + 2;
        const rowErrors = validateRow(row, rowNum);

        if (rowErrors.length > 0) {
          for (const msg of rowErrors) {
            allErrors.push({ row: rowNum, message: msg });
          }
          continue;
        }

        rowsToInsert.push({
          title: row.title?.trim(),
          description: row.description?.trim() || null,
          type: row.type?.trim() as AcervoType,
          subType: row.subType?.trim() || null,
          publicationPlace: row.publicationPlace?.trim() || null,
          publicationYear: row.publicationYear?.trim() || null,
          doi: row.doi?.trim() || null,
          authors: parseAuthors(row.authors),
          externalUrl: row.externalUrl?.trim() || null,
          images: [],
          attachment: null,
          userId: req.user?.id || null,
        });
      }

      if (rowsToInsert.length > 0) {
        await db.insert(acervo).values(rowsToInsert);
      }

      return res.status(201).json({
        imported: rowsToInsert.length,
        totalRows: records.length,
        errors: allErrors,
      });
    } catch (error: any) {
      console.error('Erro na importação CSV:', error);
      return res.status(500).json({ message: error.message || 'Erro ao processar importação CSV' });
    }
  },
};

export default acervoImportController;

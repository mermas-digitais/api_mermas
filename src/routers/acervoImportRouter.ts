import { Router } from 'express';
import multer from 'multer';
import acervoImportController from '../controllers/acervoImportController';
import verifyToken from './middleware';

const importRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter(_req, file, cb) {
    if (!file.originalname.endsWith('.csv')) {
      return cb(new Error('Apenas arquivos CSV são aceitos'));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /api/v1/acervo/import:
 *   post:
 *     summary: Importar itens do acervo em massa via CSV
 *     description: >
 *       Realiza a importação em massa de itens do acervo a partir de um arquivo CSV.
 *       O CSV deve conter cabeçalhos nas primeiras colunas. Imagens e anexos não são
 *       incluídos no CSV (são binários) e devem ser adicionados individualmente após a importação.
 *     tags: [Acervo]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: >
 *                   Arquivo CSV com os dados. Colunas obrigatórias: title, type.
 *                   Colunas opcionais: description, subType, publicationPlace,
 *                   publicationYear, doi, authors, externalUrl.
 *                   Autores devem ser separados por vírgula.
 *     responses:
 *       201:
 *         description: Importação concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imported:
 *                   type: number
 *                   example: 10
 *                 totalRows:
 *                   type: number
 *                   example: 12
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: number
 *                       message:
 *                         type: string
 *       400:
 *         description: Erro de validação ou formato do CSV
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno ao processar importação
 */
importRouter.post(
  '/import',
  verifyToken as any,
  upload.array('file', 1) as any,
  acervoImportController.importCsv as any
);

export default importRouter;

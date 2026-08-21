import { Router } from 'express';
import doiController from '../controllers/doiController';

const doiRouter = Router();

/**
 * @openapi
 * /api/v1/doi:
 *   get:
 *     summary: Buscar metadados de artigo por DOI via CrossRef
 *     description: >
 *       Consulta a API pública do CrossRef para retornar informações
 *       bibliográficas de um artigo a partir do seu DOI.
 *       Retorna título, autores, periódico, tipo, ano de publicação, URL e resumo (se disponível).
 *     tags: [DOI]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: doi
 *         required: true
 *         schema:
 *           type: string
 *         description: >
 *           DOI do artigo. Aceita no formato puro (10.1000/182) ou URL completa (https://doi.org/10.1000/182)
 *         example: 10.1038/nature12373
 *     responses:
 *       200:
 *         description: Metadados do artigo encontrados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DOIMetadata'
 *       400:
 *         description: DOI não informado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Nenhum artigo encontrado para o DOI informado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro ao consultar API externa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
doiRouter.get('/', doiController.lookupByDoi);

export default doiRouter;

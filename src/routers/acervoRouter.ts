import { Router } from 'express';
import multer from 'multer';
import acervoController from '../controllers/acervoController';
import verifyToken from './middleware';

const acervoRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

const uploadFields = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'attachment', maxCount: 1 },
]);

/**
 * @openapi
 * /api/v1/acervo:
 *   get:
 *     summary: Listar itens do acervo
 *     tags: [Acervo]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [jogo, artigo, material, certificado]
 *         description: Filtrar por categoria
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por palavra-chave no título
 *     responses:
 *       200:
 *         description: Lista de itens do acervo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcervoItem'
 *   post:
 *     summary: Criar novo item no acervo
 *     tags: [Acervo]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Jogo Educativo de Lógica
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [jogo, artigo, material, certificado]
 *                 example: jogo
 *               subType:
 *                 type: string
 *                 example: resumo expandido
 *               publicationPlace:
 *                 type: string
 *               doi:
 *                 type: string
 *               authors:
 *                 type: string
 *                 example: Ana Silva, Carlos Souza
 *               externalUrl:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Item criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcervoItem'
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 *
 * /api/v1/acervo/{id}:
 *   get:
 *     summary: Buscar item do acervo por ID
 *     tags: [Acervo]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalhes do item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AcervoItem'
 *       404:
 *         description: Item não encontrado
 *   put:
 *     summary: Atualizar item do acervo
 *     tags: [Acervo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [jogo, artigo, material, certificado]
 *               subType:
 *                 type: string
 *               publicationPlace:
 *                 type: string
 *               doi:
 *                 type: string
 *               authors:
 *                 type: string
 *               externalUrl:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Item atualizado com sucesso
 *       404:
 *         description: Item não encontrado
 *   delete:
 *     summary: Deletar item do acervo
 *     tags: [Acervo]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */

acervoRouter.get('/', acervoController.getItems as any);
acervoRouter.get('/:id', acervoController.getItemById as any);

acervoRouter.post('/', verifyToken as any, uploadFields as any, acervoController.createItem as any);
acervoRouter.put('/:id', verifyToken as any, uploadFields as any, acervoController.updateItem as any);
acervoRouter.delete('/:id', verifyToken as any, acervoController.deleteItem as any);

export default acervoRouter;

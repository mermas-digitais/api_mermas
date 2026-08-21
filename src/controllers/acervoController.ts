import { Request, Response } from 'express';
import { eq, desc, and, ilike } from 'drizzle-orm';
import { db } from '../db';
import { acervo, acervoTypes, AcervoType } from '../db/schema';
import { uploadToS3, deleteFromS3, FileMetadata } from '../utils/s3Upload';
import { AuthenticatedRequest } from '../routers/middleware';

function parseAuthors(input: any): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return input.split(',').map((a) => a.trim()).filter(Boolean);
    }
  }
  return [];
}

export const acervoController = {
  createItem: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title, description, type, subType, publicationPlace, externalUrl, doi, authors } = req.body;

      if (!title || !type) {
        return res.status(400).json({ message: 'Título e tipo são obrigatórios' });
      }

      if (!acervoTypes.includes(type as AcervoType)) {
        return res.status(400).json({
          message: `Tipo inválido. Tipos permitidos: ${acervoTypes.join(', ')}`,
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      const imageFiles = files?.images || [];
      const attachmentFiles = files?.attachment || [];

      const images: FileMetadata[] = [];
      for (const file of imageFiles) {
        const uploaded = await uploadToS3(file, 'acervo/images');
        images.push(uploaded);
      }

      let attachment: FileMetadata | null = null;
      if (attachmentFiles.length > 0) {
        attachment = await uploadToS3(attachmentFiles[0], 'acervo/attachments');
      }

      const parsedAuthors = parseAuthors(authors);

      const [newItem] = await db
        .insert(acervo)
        .values({
          title,
          description: description || null,
          type: type as AcervoType,
          subType: subType || null,
          publicationPlace: publicationPlace || null,
          images,
          attachment,
          externalUrl: externalUrl || null,
          doi: doi || null,
          authors: parsedAuthors,
          userId: req.user?.id || null,
        })
        .returning();

      return res.status(201).json(newItem);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message || 'Erro ao criar item do acervo' });
    }
  },

  getItems: async (req: Request, res: Response) => {
    try {
      const { type, search } = req.query;

      const filters = [];

      if (type && acervoTypes.includes(type as AcervoType)) {
        filters.push(eq(acervo.type, type as AcervoType));
      }

      if (search && typeof search === 'string') {
        filters.push(ilike(acervo.title, `%${search}%`));
      }

      const query = db
        .select()
        .from(acervo)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(acervo.createdAt));

      const items = await query;
      return res.json(items);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao listar acervo' });
    }
  },

  getItemById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [item] = await db.select().from(acervo).where(eq(acervo.id, id));

      if (!item) {
        return res.status(404).json({ message: 'Item do acervo não encontrado' });
      }

      return res.json(item);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao buscar item' });
    }
  },

  updateItem: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, description, type, subType, publicationPlace, externalUrl, doi, authors } = req.body;

      const [existing] = await db.select().from(acervo).where(eq(acervo.id, id));
      if (!existing) {
        return res.status(404).json({ message: 'Item do acervo não encontrado' });
      }

      if (type && !acervoTypes.includes(type as AcervoType)) {
        return res.status(400).json({
          message: `Tipo inválido. Tipos permitidos: ${acervoTypes.join(', ')}`,
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const imageFiles = files?.images || [];
      const attachmentFiles = files?.attachment || [];

      let updatedImages = existing.images || [];
      if (imageFiles.length > 0) {
        const newImages: FileMetadata[] = [];
        for (const file of imageFiles) {
          const uploaded = await uploadToS3(file, 'acervo/images');
          newImages.push(uploaded);
        }
        updatedImages = [...updatedImages, ...newImages];
      }

      let updatedAttachment = existing.attachment;
      if (attachmentFiles.length > 0) {
        if (existing.attachment?.key) {
          await deleteFromS3(existing.attachment.key);
        }
        updatedAttachment = await uploadToS3(attachmentFiles[0], 'acervo/attachments');
      }

      const parsedAuthors = authors !== undefined ? parseAuthors(authors) : existing.authors;

      const [updatedItem] = await db
        .update(acervo)
        .set({
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(type && { type: type as AcervoType }),
          ...(subType !== undefined && { subType }),
          ...(publicationPlace !== undefined && { publicationPlace }),
          ...(externalUrl !== undefined && { externalUrl }),
          ...(doi !== undefined && { doi }),
          authors: parsedAuthors,
          images: updatedImages,
          attachment: updatedAttachment,
          updatedAt: new Date(),
        })
        .where(eq(acervo.id, id))
        .returning();

      return res.json(updatedItem);
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao atualizar item' });
    }
  },

  deleteItem: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const [item] = await db.select().from(acervo).where(eq(acervo.id, id));

      if (!item) {
        return res.status(404).json({ message: 'Item do acervo não encontrado' });
      }

      if (item.images && item.images.length > 0) {
        for (const img of item.images) {
          if (img.key) await deleteFromS3(img.key);
        }
      }

      if (item.attachment?.key) {
        await deleteFromS3(item.attachment.key);
      }

      await db.delete(acervo).where(eq(acervo.id, id));

      return res.json({ message: 'Item removido do acervo com sucesso', id });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Erro ao deletar item' });
    }
  },
};

export default acervoController;

import swaggerJSDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Mermas - Acervo Digital',
      version: '1.0.0',
      description: 'API RESTful para gestão do Acervo Mermas (jogos, artigos, materiais de aula e certificados) com autenticação via Better Auth e armazenamento em Garage S3.',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`,
        description: 'Servidor Local',
      },
      {
        url: 'https://apimd.fabitz.com.br',
        description: 'Servidor de Produção',
      },
    ],
    security: [
      { bearerAuth: [] },
      { cookieAuth: [] },
    ],
    components: {
      schemas: {
        FileMetadata: {
          type: 'object',
          properties: {
            url: { type: 'string', example: 'https://s3.seudominio.com.br/mermas-acervo/acervo/images/uuid.png' },
            key: { type: 'string', example: 'acervo/images/uuid.png' },
            fileName: { type: 'string', example: 'exemplo.png' },
            mimeType: { type: 'string', example: 'image/png' },
            size: { type: 'number', example: 102450 },
          },
        },
        AcervoItem: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            title: { type: 'string', example: 'Jogo Educativo de Programação' },
            description: { type: 'string', nullable: true, example: 'Jogo interativo desenvolvido para ensino de lógica.' },
            type: { type: 'string', enum: ['jogo', 'artigo', 'material', 'certificado'], example: 'artigo' },
            subType: { type: 'string', nullable: true, example: 'resumo expandido' },
            publicationPlace: { type: 'string', nullable: true, example: 'Revista Brasileira de Computação' },
            doi: { type: 'string', nullable: true, example: '10.1000/182' },
            authors: {
              type: 'array',
              items: { type: 'string' },
              example: ['Ana Silva', 'Carlos Souza'],
            },
            externalUrl: { type: 'string', nullable: true, example: 'https://exemplo.com/artigo.pdf' },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/FileMetadata' },
            },
            attachment: {
              $ref: '#/components/schemas/FileMetadata',
              nullable: true,
            },
            userId: { type: 'string', nullable: true, example: 'user_12345' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-08-21T04:30:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-08-21T04:30:00.000Z' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_12345' },
            name: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', example: 'maria@mermas.com' },
            emailVerified: { type: 'boolean', example: false },
            image: { type: 'string', nullable: true, example: 'https://exemplo.com/avatar.jpg' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SessionResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            session: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                userId: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Mensagem explicativa do erro' },
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token de autorização enviado via header Authorization: Bearer <token>',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
          description: 'Cookie de sessão gerado pelo Better Auth',
        },
      },
    },
  },
  apis: ['./src/routers/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

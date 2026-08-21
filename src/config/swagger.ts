import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 8080;
const localUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${port}`;
const prodUrl = 'https://mdapi.fabitz.com.br';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'API Mermas - Acervo Digital',
    version: '1.0.0',
    description: 'API RESTful para gestão do Acervo Mermas (jogos, artigos, materiais de aula e certificados) com autenticação via Better Auth e armazenamento em Garage S3.',
    contact: {
      name: 'Mermas Digital',
      url: 'https://www.mermasdigitais.com.br',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    { url: prodUrl, description: 'Produção' },
    { url: localUrl, description: 'Desenvolvimento Local' },
  ],
  tags: [
    { name: 'Geral', description: 'Endpoints de verificação e status da API' },
    { name: 'Autenticação', description: 'Cadastros, logins e gerenciamento de sessão via Better Auth' },
    { name: 'Acervo', description: 'Gestão de itens do acervo (jogos, artigos, materiais, certificados)' },
    { name: 'DOI', description: 'Consulta de metadados bibliográficos por DOI via CrossRef' },
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
          publicationYear: { type: 'string', nullable: true, example: '2024', description: 'Ano de publicação (formato: AAAA)' },
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
            ...{ $ref: '#/components/schemas/FileMetadata' },
            nullable: true,
          },
          userId: { type: 'string', nullable: true, example: 'user_12345' },
          createdAt: { type: 'string', format: 'date-time', example: '2026-08-21T04:30:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2026-08-21T04:30:00.000Z' },
        },
      },
      AcervoPaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/AcervoItem' },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'number', example: 150, description: 'Total de itens encontrados' },
              page: { type: 'number', example: 1, description: 'Página atual' },
              limit: { type: 'number', example: 20, description: 'Itens por página' },
              totalPages: { type: 'number', example: 8, description: 'Total de páginas' },
              hasNext: { type: 'boolean', example: true, description: 'Existe próxima página' },
              hasPrev: { type: 'boolean', example: false, description: 'Existe página anterior' },
            },
          },
        },
      },
      DOIMetadata: {
        type: 'object',
        properties: {
          doi: { type: 'string', example: '10.1038/nature12373' },
          title: { type: 'string', example: 'Nanometre-scale thermometry in a living cell' },
          authors: {
            type: 'array',
            items: { type: 'string' },
            example: ['G. Baffou', 'H. Rigneault', 'D. Marguet', 'P. Lenne'],
          },
          publicationPlace: { type: 'string', example: 'Nature' },
          type: { type: 'string', example: 'journal-article' },
          year: { type: 'number', nullable: true, example: 2013 },
          url: { type: 'string', example: 'https://doi.org/10.1038/nature12373' },
          abstract: { type: 'string', nullable: true, example: 'Resumo do artigo...' },
          source: { type: 'string', example: 'crossref' },
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
  paths: {
    '/api/v1/health': {
      get: {
        summary: 'Healthcheck da API',
        tags: ['Geral'],
        security: [],
        responses: {
          '200': {
            description: 'API online e operacional',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    message: { type: 'string', example: 'API Mermas Acervo v1 online' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/doi': {
      get: {
        summary: 'Buscar metadados de artigo por DOI via CrossRef',
        tags: ['DOI'],
        security: [],
        parameters: [
          {
            in: 'query',
            name: 'doi',
            required: true,
            schema: { type: 'string' },
            description: 'DOI do artigo (puro ou URL completa)',
            example: '10.1038/nature12373',
          },
        ],
        responses: {
          '200': {
            description: 'Metadados do artigo encontrados',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DOIMetadata' },
              },
            },
          },
          '400': { description: 'DOI não informado' },
          '404': { description: 'Nenhum artigo encontrado para o DOI informado' },
          '500': { description: 'Erro ao consultar API externa' },
        },
      },
    },
    '/api/v1/auth/sign-up/email': {
      post: {
        summary: 'Cadastrar novo usuário',
        tags: ['Autenticação'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  name: { type: 'string', example: 'Maria Silva' },
                  email: { type: 'string', example: 'maria@mermas.com' },
                  password: { type: 'string', example: 'senhaSegura123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Usuário cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionResponse' },
              },
            },
          },
          '400': { description: 'Dados inválidos ou e-mail já em uso' },
        },
      },
    },
    '/api/v1/auth/sign-in/email': {
      post: {
        summary: 'Autenticar usuário com e-mail e senha',
        tags: ['Autenticação'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'maria@mermas.com' },
                  password: { type: 'string', example: 'senhaSegura123' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login bem-sucedido e sessão criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionResponse' },
              },
            },
          },
          '401': { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/v1/auth/get-session': {
      get: {
        summary: 'Obter dados da sessão do usuário autenticado',
        tags: ['Autenticação'],
        responses: {
          '200': {
            description: 'Dados do usuário e da sessão',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SessionResponse' },
              },
            },
          },
          '401': { description: 'Nenhuma sessão ativa' },
        },
      },
    },
    '/api/v1/auth/sign-out': {
      post: {
        summary: 'Encerrar sessão do usuário (Logout)',
        tags: ['Autenticação'],
        responses: {
          '200': { description: 'Sessão encerrada com sucesso' },
        },
      },
    },
    '/api/v1/acervo': {
      get: {
        summary: 'Listar itens do acervo com paginação, filtros e ordenação',
        tags: ['Acervo'],
        security: [],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'number', default: 1 },
            description: 'Página atual',
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'number', default: 20, maximum: 100 },
            description: 'Itens por página (máx: 100)',
          },
          {
            in: 'query',
            name: 'type',
            schema: { type: 'string', enum: ['jogo', 'artigo', 'material', 'certificado'] },
            description: 'Filtrar por categoria do acervo',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Busca por palavra-chave no título',
          },
          {
            in: 'query',
            name: 'sortBy',
            schema: { type: 'string', enum: ['createdAt', 'updatedAt', 'title'], default: 'createdAt' },
            description: 'Campo para ordenação',
          },
          {
            in: 'query',
            name: 'order',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            description: 'Direção da ordenação',
          },
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date' },
            description: 'Data inicial do filtro (ISO 8601: 2026-01-01)',
            example: '2026-01-01',
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date' },
            description: 'Data final do filtro (ISO 8601: 2026-12-31)',
            example: '2026-12-31',
          },
          {
            in: 'query',
            name: 'dateField',
            schema: { type: 'string', enum: ['createdAt', 'updatedAt'], default: 'createdAt' },
            description: 'Campo de data para o filtro de período',
          },
        ],
        responses: {
          '200': {
            description: 'Lista paginada de itens do acervo',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AcervoPaginatedResponse' },
              },
            },
          },
        },
      },
      post: {
        summary: 'Criar novo item no acervo',
        tags: ['Acervo'],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['title', 'type'],
                properties: {
                  title: { type: 'string', example: 'Jogo Educativo de Programação' },
                  description: { type: 'string' },
                  type: { type: 'string', enum: ['jogo', 'artigo', 'material', 'certificado'] },
                  subType: { type: 'string' },
                  publicationPlace: { type: 'string' },
                  publicationYear: { type: 'string', description: 'Ano de publicação (formato: AAAA)', example: '2024' },
                  doi: { type: 'string' },
                  authors: { type: 'string', description: 'JSON array ou vírgula separada' },
                  externalUrl: { type: 'string' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                  attachment: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Item criado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AcervoItem' },
              },
            },
          },
          '400': { description: 'Campos obrigatórios ausentes ou tipo inválido' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
    '/api/v1/acervo/{id}': {
      get: {
        summary: 'Buscar item do acervo por ID',
        tags: ['Acervo'],
        security: [],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Detalhes do item',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AcervoItem' },
              },
            },
          },
          '404': { description: 'Item não encontrado' },
        },
      },
      put: {
        summary: 'Atualizar item do acervo',
        tags: ['Acervo'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  type: { type: 'string', enum: ['jogo', 'artigo', 'material', 'certificado'] },
                  subType: { type: 'string' },
                  publicationPlace: { type: 'string' },
                  publicationYear: { type: 'string', description: 'Ano de publicação (formato: AAAA)' },
                  doi: { type: 'string' },
                  authors: { type: 'string' },
                  externalUrl: { type: 'string' },
                  images: { type: 'array', items: { type: 'string', format: 'binary' } },
                  attachment: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Item atualizado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AcervoItem' },
              },
            },
          },
          '404': { description: 'Item não encontrado' },
          '401': { description: 'Não autorizado' },
        },
      },
      delete: {
        summary: 'Deletar item do acervo',
        tags: ['Acervo'],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Item deletado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Item removido do acervo com sucesso' },
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
          '404': { description: 'Item não encontrado' },
          '401': { description: 'Não autorizado' },
        },
      },
    },
  },
};

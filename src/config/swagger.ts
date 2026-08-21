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
  },
  servers: [
    {
      url: prodUrl,
      description: 'Servidor de Produção',
    },
    {
      url: localUrl,
      description: 'Servidor Local',
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
          '400': {
            description: 'Dados inválidos ou e-mail já em uso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
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
          '401': {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
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
          '401': {
            description: 'Nenhuma sessão ativa',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/auth/sign-out': {
      post: {
        summary: 'Encerrar sessão do usuário (Logout)',
        tags: ['Autenticação'],
        responses: {
          '200': {
            description: 'Sessão encerrada com sucesso',
          },
        },
      },
    },
    '/api/v1/acervo': {
      get: {
        summary: 'Listar itens do acervo',
        tags: ['Acervo'],
        security: [],
        parameters: [
          {
            in: 'query',
            name: 'type',
            schema: {
              type: 'string',
              enum: ['jogo', 'artigo', 'material', 'certificado'],
            },
            description: 'Filtrar por categoria do acervo',
          },
          {
            in: 'query',
            name: 'search',
            schema: { type: 'string' },
            description: 'Busca por palavra-chave no título',
          },
        ],
        responses: {
          '200': {
            description: 'Lista de itens do acervo',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/AcervoItem' },
                },
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
                  description: { type: 'string', example: 'Jogo interativo desenvolvido para ensino de lógica.' },
                  type: {
                    type: 'string',
                    enum: ['jogo', 'artigo', 'material', 'certificado'],
                    example: 'jogo',
                  },
                  subType: { type: 'string', example: 'resumo expandido' },
                  publicationPlace: { type: 'string', example: 'Revista de Tecnologia' },
                  doi: { type: 'string', example: '10.1000/182' },
                  authors: {
                    type: 'string',
                    description: 'Lista de autores (array JSON ou separados por vírgula)',
                    example: 'Ana Silva, Carlos Souza',
                  },
                  externalUrl: { type: 'string', example: 'https://exemplo.com/artigo.pdf' },
                  images: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                    description: 'Até 5 imagens para o item',
                  },
                  attachment: {
                    type: 'string',
                    format: 'binary',
                    description: 'Arquivo para download (PDF, ZIP, etc.)',
                  },
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
          '400': {
            description: 'Campos obrigatórios ausentes ou tipo inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/acervo/{id}': {
      get: {
        summary: 'Buscar item do acervo por ID',
        tags: ['Acervo'],
        security: [],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
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
          '404': {
            description: 'Item não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      put: {
        summary: 'Atualizar item do acervo',
        tags: ['Acervo'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
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
          '404': {
            description: 'Item não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        summary: 'Deletar item do acervo',
        tags: ['Acervo'],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
          },
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
          '404': {
            description: 'Item não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '401': {
            description: 'Não autorizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};

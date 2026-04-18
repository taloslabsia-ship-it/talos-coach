export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'TALOS Coach API v1',
      version: '1.0.0',
      description: 'API REST para TALOS Coach. Soporta autenticación via API Key o sesión web.',
      contact: { email: 'taloslabsia@gmail.com' },
    },
    servers: [
      { url: 'https://talos-coach--talos-agente-personal-agustin.us-east4.hosted.app', description: 'Production' },
      { url: 'http://localhost:3000', description: 'Local' },
    ],
    components: {
      securitySchemes: {
        ApiKeyHeader: { type: 'apiKey', in: 'header', name: 'x-api-key', description: 'API Secret Key' },
        ApiKeyQuery: { type: 'apiKey', in: 'query', name: 'api_key', description: 'API Secret Key as query param' },
        SessionCookie: { type: 'apiKey', in: 'cookie', name: '__session', description: 'Session cookie from /api/auth/session' },
      },
      schemas: {
        Note: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string', enum: ['tarea', 'nota', 'idea', 'pendiente', 'prompt', 'compras', 'trabajo', 'personal'] },
            source: { type: 'string', enum: ['talos_api', 'manual', 'talos_bot'] },
            completed: { type: 'boolean' },
            status: { type: 'string', enum: ['pendiente', 'en_progreso', 'completada'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Evento: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            text: { type: 'string' },
            date: { type: 'string', format: 'date' },
            time: { type: 'string', pattern: '\\d{2}:\\d{2}' },
            status: { type: 'string', enum: ['pending', 'done'] },
            userId: { type: 'string' },
            source: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        DiaryEntry: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            date: { type: 'string', format: 'date' },
            content: { type: 'string' },
            mood: { type: 'string', nullable: true },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Habito: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            emoji: { type: 'string' },
            description: { type: 'string', nullable: true },
            timeLabel: { type: 'string', nullable: true },
            active: { type: 'boolean' },
            sortOrder: { type: 'integer' },
            log: { type: 'object', nullable: true },
          },
        },
        Reflexion: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            date: { type: 'string', format: 'date' },
            type: { type: 'string', enum: ['morning', 'evening'] },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            data: { type: 'null' },
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
        ListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                items: { type: 'array' },
                total: { type: 'integer' },
              },
            },
            error: { type: 'null' },
          },
        },
      },
    },
    paths: {
      '/api/v1/notas': {
        get: {
          summary: 'Listar notas',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filtrar por categoría' },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 }, description: 'Máximo 200' },
          ],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
        },
        post: {
          summary: 'Crear nota',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    category: { type: 'string', default: 'nota' },
                  },
                },
              },
            },
          },
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 201: { description: 'Created' }, 400: { description: 'Bad Request' } },
        },
      },
      '/api/v1/notas/{id}': {
        get: {
          summary: 'Obtener nota por ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' }, 404: { description: 'Not Found' } },
        },
        patch: {
          summary: 'Actualizar nota',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
        delete: {
          summary: 'Eliminar nota',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },
      '/api/v1/eventos': {
        get: {
          summary: 'Listar eventos',
          parameters: [
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'done', 'all'], default: 'pending' } },
          ],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } },
        },
        post: {
          summary: 'Crear evento/recordatorio',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text', 'date', 'time'],
                  properties: {
                    text: { type: 'string', description: 'Título del evento' },
                    date: { type: 'string', format: 'date', example: '2026-04-25' },
                    time: { type: 'string', pattern: '\\d{2}:\\d{2}', example: '15:00' },
                  },
                },
              },
            },
          },
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 201: { description: 'Created' }, 400: { description: 'Bad Request' } },
        },
      },
      '/api/v1/eventos/{id}': {
        patch: {
          summary: 'Actualizar evento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
        delete: {
          summary: 'Eliminar evento',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },
      '/api/v1/diario': {
        get: {
          summary: 'Listar entradas del diario',
          parameters: [
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 30 } },
            { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
        post: {
          summary: 'Crear/actualizar entrada de diario',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['content'],
                  properties: {
                    content: { type: 'string' },
                    date: { type: 'string', format: 'date', description: 'Default: hoy' },
                    mood: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' }, 201: { description: 'Created' } },
        },
      },
      '/api/v1/habitos': {
        get: {
          summary: 'Obtener hábitos del día',
          parameters: [{ name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'Default: hoy' }],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },
      '/api/v1/reflexiones': {
        get: {
          summary: 'Listar reflexiones',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string', enum: ['morning', 'evening'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 30 } },
          ],
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
        post: {
          summary: 'Crear reflexión',
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 201: { description: 'Created' } },
        },
      },
      '/api/v1/stats': {
        get: {
          summary: 'Obtener estadísticas',
          security: [{ ApiKeyHeader: [] }, { SessionCookie: [] }],
          responses: { 200: { description: 'OK' } },
        },
      },
    },
  };

  return Response.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}

import Fastify from 'fastify';
import cors from '@fastify/cors';
import crypto from 'crypto';

const fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024, // Soporta hasta 50MB en uploads
});

// Habilitar CORS para permitir peticiones desde clientes móviles y web
fastify.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
});

// Endpoint de Salud / Ping rápido
fastify.get('/health', async () => {
  return {
    status: 'ok',
    service: 'Network QoS Throughput Reference Server',
    timestamp: Date.now(),
  };
});

// Endpoint de Descarga (Download test)
// Genera datos pseudoaleatorios de alto nivel de entropía para evitar compresión de sockets intermedios
fastify.get('/download', async (request, reply) => {
  const query = request.query as { bytes?: string };
  const requestedBytes = parseInt(query.bytes || '5242880', 10); // 5 MB por defecto
  const safeBytes = Math.min(Math.max(requestedBytes, 1024), 25 * 1024 * 1024); // Entre 1KB y 25MB

  reply.header('Content-Type', 'application/octet-stream');
  reply.header('Content-Length', safeBytes.toString());
  reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  // Buffer pseudoaleatorio
  const buffer = crypto.randomBytes(safeBytes);
  return reply.send(buffer);
});

// Endpoint de Subida (Upload test)
// Lee el payload recibido, descarta el buffer en memoria y devuelve los bytes totales recibidos
fastify.post('/upload', async (request, reply) => {
  const startTime = Date.now();
  let receivedBytes = 0;

  if (Buffer.isBuffer(request.body)) {
    receivedBytes = request.body.length;
  } else if (typeof request.body === 'string') {
    receivedBytes = Buffer.byteLength(request.body);
  } else if (request.body && typeof request.body === 'object') {
    receivedBytes = Buffer.byteLength(JSON.stringify(request.body));
  }

  const durationMs = Math.max(1, Date.now() - startTime);

  reply.header('Cache-Control', 'no-store, no-cache');
  return {
    status: 'completed',
    receivedBytes,
    serverProcessingMs: durationMs,
    timestamp: Date.now(),
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`Throughput test server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

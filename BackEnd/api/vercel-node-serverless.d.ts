/**
 * Este é um arquivo de declaração de tipos customizado para o módulo 'vercel-node-serverless'.
 * O TypeScript usa arquivos .d.ts para entender os tipos de bibliotecas JavaScript.
 * Ao criar este arquivo, estamos dizendo ao TypeScript o que é o 'vercel-node-serverless'
 * e quais funções ele exporta, o que resolve o erro "Cannot find module".
 */
declare module 'vercel-node-serverless' {
  import { Server, RequestListener } from 'http';

  /**
   * Declara a função createServer.
   * @param listener - Um 'request listener', tipicamente a instância de um app Express ou NestJS.
   * @returns Uma instância de um servidor HTTP.
   */
  export function createServer(listener: RequestListener): Server;

  /**
   * Declara a função proxy.
   * @param req - O objeto da requisição recebida.
   * @param res - O objeto da resposta do servidor.
   * @param server - A instância do servidor para o qual a requisição será encaminhada.
   */
  export function proxy(req: any, res: any, server: Server): void;
}


import swaggerJsdoc from 'swagger-jsdoc';
import type { SwaggerUiOptions } from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

dotenv.config();

// Load base YAML
const baseSpec = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8')) as any;

// Apply environment variables
baseSpec.servers[0].url = `http://localhost:${process.env.PORT || 5000}/api`;

const options: swaggerJsdoc.Options = {
  definition: baseSpec,
  apis: [
    path.join(__dirname, 'paths/*.yaml'),
    path.join(__dirname, 'schemas/*.yaml'),
    './src/api/routes/*.ts', // Still keep your route files for operationId
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions: SwaggerUiOptions = {
  customSiteTitle: 'Event Management API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
  explorer: true,
};

export { swaggerSpec, swaggerUiOptions };

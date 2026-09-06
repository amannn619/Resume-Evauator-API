// swagger.js
import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
      title: 'Portfolio',
      description: 'Portfolio backend API'
    },
    host: 'localhost:3000',
  };

const outputFile = './swagger-output.json';
const routes = ['./src/main.js'];

swaggerAutogen()(outputFile, routes, doc);
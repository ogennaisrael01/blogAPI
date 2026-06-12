import swaggerAutogen from 'swagger-autogen';
import "dotenv/config"

const doc = {
  info: {
    title: 'Automatically Documented API For Blogging Application',
    version: '1.0.0'
  },
  host: `0.0.0.0:${process.env.PORT}`,
  schemes: [process.env.NODE_ENV === "development" ? "http" :  "https"]
};

const outputFile = './swagger-output.json';
const routesFiles = ['./src/index.ts']; 

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routesFiles, doc);

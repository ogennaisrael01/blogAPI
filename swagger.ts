import swaggerAutogen from 'swagger-autogen';
import "dotenv/config"

const doc = {
  info: {
    title: 'Automatically Documented API For Blogging Application',
    version: '1.0.0'
  },
  host: `${process.env.HOST_NAME}:${process.env.PORT}`,
  schemes: [process.env.NODE_ENV === "development" ? "http" :  "https"]
};

const outputFile = './swagger-output.json';
const routesFiles = ['./src/index.ts']; 

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routesFiles, doc);

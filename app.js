const express = require('express');
const app = express();
const cors = require('cors');
const apiRoute = require('./routes/api');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const page = require('./routes/pages')
require('dotenv').config();


// Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Bible API',
        version: '1.0.0',
        description: 'API for accessing Bible chapters, books, pages, and verses in 18 languages.',
    },
    servers: [
        {
            url: process.env.SERVER_URL, 
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./routes/api.js'],
};
const swaggerSpec = swaggerJSDoc(options);

app.use(express.static('public'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(cors());
app.use('/api', apiRoute);
app.use('/', page)

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

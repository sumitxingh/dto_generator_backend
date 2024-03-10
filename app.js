const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { generateDTOFromPrismaSchema } = require('./dtoGenerator');

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.text());
const PORT = process.env.PORT || 5000;


const validatePrismaSchema = (req, res, next) => {
  if (!req.body) {
    return res.status(400).send('Prisma schema is required');
  }
  next();
};

app.post('/generate-dtos', validatePrismaSchema, (req, res) => {
  const prismaSchema = req.body || '';
  const parsedSchema = generateDTOFromPrismaSchema(prismaSchema);
  res.send(parsedSchema);
});

app.get('/', (req, res) => {
  res.json({
    message: 'Hello world'
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

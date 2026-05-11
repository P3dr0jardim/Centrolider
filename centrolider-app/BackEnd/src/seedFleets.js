require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Fleet = require('./models/Fleet');

const fleets = [
  { name: 'ARM',     description: 'Água e Resíduos da Madeira' },
  { name: 'CMC',     description: 'Câmara Municipal da Calheta' },
  { name: 'CMF',     description: 'Câmara Municipal do Funchal' },
  { name: 'CMSC',    description: 'Câmara Municipal de Santa Cruz' },
  { name: 'DRPA',    description: 'DRPA' },
  { name: 'IDR',     description: 'Instituto de Desenvolvimento Regional' },
  { name: 'IEM',     description: 'IEM' },
  { name: 'IMT',     description: 'IMT' },
  { name: 'IQ',      description: 'IQ' },
  { name: 'ISSM',    description: 'Instituto de Segurança Social da Madeira' },
  { name: 'Proderam',description: 'Proderam' },
  { name: 'Sesaram', description: 'Serviço de Saúde da Região Autónoma da Madeira' },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  for (const fleet of fleets) {
    const existing = await Fleet.findOne({ name: fleet.name });
    if (existing) {
      console.log(`  — ${fleet.name} already exists, skipping`);
    } else {
      await Fleet.create(fleet);
      console.log(`  ✓ ${fleet.name} created`);
    }
  }

  console.log('\nDone.');
  process.exit(0);
}

run().catch(err => { console.error(err.message); process.exit(1); });

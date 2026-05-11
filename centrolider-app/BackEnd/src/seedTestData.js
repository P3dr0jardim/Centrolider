require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Fleet    = require('./models/Fleet');
const Vehicle  = require('./models/Vehicle');
const Expense  = require('./models/Expense');
const Revenue  = require('./models/Revenue');
const Schedule = require('./models/Schedule');
const StockItem = require('./models/StockItem');

// ── helpers ───────────────────────────────────────────────────────────────────
const daysAgo  = (n) => new Date(Date.now() - n * 86400000);
const daysAhead = (n) => new Date(Date.now() + n * 86400000);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // ── Fleet ─────────────────────────────────────────────────────────────────
  let fleet = await Fleet.findOne({ name: 'Test Fleet' });
  if (fleet) {
    // clean up previous test data so the script is idempotent
    const vehicleIds = (await Vehicle.find({ frotaId: fleet._id })).map(v => v._id);
    await Vehicle.deleteMany({ frotaId: fleet._id });
    await Expense.deleteMany({ vehicleId: { $in: vehicleIds } });
    await Revenue.deleteMany({ vehicleId: { $in: vehicleIds } });
    await Schedule.deleteMany({ viaturaId: { $in: vehicleIds } });
    await Fleet.deleteOne({ _id: fleet._id });
    console.log('Removed previous Test Fleet data\n');
  }

  fleet = await Fleet.create({
    name: 'Test Fleet',
    description: 'Frota de testes — dados fictícios',
  });
  console.log(`Fleet created: Test Fleet (${fleet._id})\n`);

  // ── Vehicles ──────────────────────────────────────────────────────────────
  const vehicleDefs = [
    {
      matricula:        'TS-01-AA',
      modelo:           'Volkswagen Transporter 2.0 TDI',
      condutor:         'João Silva',
      km:               52400,
      status:           'Operacional',
      combustivel:      'Diesel',
      cor:              'Branco',
      dataEntrega:      daysAgo(730),
      dataMatricula:    daysAgo(750),
      proximaRevisao:   daysAhead(45),
      validadeContrato: daysAhead(365),
      intervaloRevisao: 15000,
      kmsUltimaRevisao: 45000,
      rentabilidade:    320.50,
      numeroContrato:   'T-001',
    },
    {
      matricula:        'TS-02-BB',
      modelo:           'Renault Kangoo 1.5 dCi',
      condutor:         'Maria Santos',
      km:               34800,
      status:           'Operacional',
      combustivel:      'Diesel',
      cor:              'Cinzento',
      dataEntrega:      daysAgo(500),
      dataMatricula:    daysAgo(510),
      proximaRevisao:   daysAhead(12),   // soon — will appear in agenda alerts
      validadeContrato: daysAhead(180),
      intervaloRevisao: 15000,
      kmsUltimaRevisao: 30000,
      rentabilidade:    245.00,
      numeroContrato:   'T-002',
    },
    {
      matricula:        'TS-03-CC',
      modelo:           'Ford Transit Custom 2.0 EcoBlue',
      condutor:         'Pedro Costa',
      km:               89100,
      status:           'Manutenção',
      combustivel:      'Diesel',
      cor:              'Azul',
      dataEntrega:      daysAgo(1200),
      dataMatricula:    daysAgo(1220),
      proximaRevisao:   daysAgo(30),     // overdue
      validadeContrato: daysAhead(60),
      intervaloRevisao: 20000,
      kmsUltimaRevisao: 80000,
      rentabilidade:    410.00,
      numeroContrato:   'T-003',
    },
    {
      matricula:        'TS-04-DD',
      modelo:           'Peugeot Boxer 2.2 HDi',
      condutor:         'Ana Ferreira',
      km:               71500,
      status:           'Operacional',
      combustivel:      'Diesel',
      cor:              'Branco',
      dataEntrega:      daysAgo(900),
      dataMatricula:    daysAgo(920),
      proximaRevisao:   daysAhead(90),
      validadeContrato: daysAhead(270),
      intervaloRevisao: 20000,
      kmsUltimaRevisao: 60000,
      rentabilidade:    378.00,
      numeroContrato:   'T-004',
    },
    {
      matricula:        'TS-05-EE',
      modelo:           'Fiat Doblò 1.6 Multijet',
      condutor:         null,
      km:               12300,
      status:           'Inativo',
      combustivel:      'Diesel',
      cor:              'Prata',
      dataEntrega:      daysAgo(200),
      dataMatricula:    daysAgo(210),
      proximaRevisao:   daysAhead(300),
      validadeContrato: daysAhead(500),
      intervaloRevisao: 15000,
      kmsUltimaRevisao: 8000,
      rentabilidade:    210.00,
      numeroContrato:   'T-005',
    },
  ];

  // maintenance history per vehicle
  const maintenanceSets = [
    [
      { data: daysAgo(180), kms: 40000, descricao: 'Revisão + filtros',         custo: 215.50 },
      { data: daysAgo(90),  kms: 45000, descricao: 'Pastilhas travão dianteiras', custo: 98.00  },
      { data: daysAgo(20),  kms: 52000, descricao: 'Pneus (4 unidades)',         custo: 320.00 },
    ],
    [
      { data: daysAgo(120), kms: 25000, descricao: 'Revisão + óleo',            custo: 175.00 },
      { data: daysAgo(60),  kms: 30000, descricao: 'Pastilhas + discos',         custo: 245.00 },
    ],
    [
      { data: daysAgo(300), kms: 60000, descricao: 'Revisão + kit distribuição', custo: 650.00 },
      { data: daysAgo(150), kms: 72000, descricao: 'Pneus (4 unidades)',         custo: 400.00 },
      { data: daysAgo(45),  kms: 85000, descricao: 'Avaria — bomba de água',    custo: 480.00 },
      { data: daysAgo(10),  kms: 89000, descricao: 'Reparação caixa de direção', custo: 720.00 },
    ],
    [
      { data: daysAgo(200), kms: 55000, descricao: 'Revisão + filtros',         custo: 198.00 },
      { data: daysAgo(80),  kms: 65000, descricao: 'Discos + pastilhas',        custo: 310.00 },
    ],
    [
      { data: daysAgo(50),  kms: 10000, descricao: '1.ª Revisão anual',         custo: 145.00 },
    ],
  ];

  const vehicles = [];
  for (let i = 0; i < vehicleDefs.length; i++) {
    const v = await Vehicle.create({
      frotaId: fleet._id,
      ...vehicleDefs[i],
      historicoManutencao: maintenanceSets[i].map(r => ({
        ...r, oficina: 'Oficina Central', materiaisUsados: [],
      })),
    });
    vehicles.push(v);
    console.log(`  ✓ Vehicle ${v.matricula} — ${v.modelo}`);
  }

  // ── Expenses ──────────────────────────────────────────────────────────────
  console.log('\nCreating expenses...');
  const expenseDefs = [
    { vehicleIdx: 0, tipo: 'manutencao', valor: 215.50, data: daysAgo(180), descricao: 'Revisão + filtros' },
    { vehicleIdx: 0, tipo: 'combustivel', valor: 85.00,  data: daysAgo(140), descricao: 'Abastecimento' },
    { vehicleIdx: 0, tipo: 'manutencao', valor: 98.00,  data: daysAgo(90),  descricao: 'Pastilhas travão' },
    { vehicleIdx: 0, tipo: 'portagem',   valor: 12.40,  data: daysAgo(70),  descricao: 'Via Expresso' },
    { vehicleIdx: 0, tipo: 'combustivel', valor: 92.00,  data: daysAgo(50),  descricao: 'Abastecimento' },
    { vehicleIdx: 0, tipo: 'manutencao', valor: 320.00, data: daysAgo(20),  descricao: 'Pneus' },

    { vehicleIdx: 1, tipo: 'manutencao', valor: 175.00, data: daysAgo(120), descricao: 'Revisão + óleo' },
    { vehicleIdx: 1, tipo: 'combustivel', valor: 68.00,  data: daysAgo(95),  descricao: 'Abastecimento' },
    { vehicleIdx: 1, tipo: 'manutencao', valor: 245.00, data: daysAgo(60),  descricao: 'Pastilhas + discos' },
    { vehicleIdx: 1, tipo: 'combustivel', valor: 71.00,  data: daysAgo(30),  descricao: 'Abastecimento' },

    { vehicleIdx: 2, tipo: 'manutencao', valor: 650.00, data: daysAgo(300), descricao: 'Kit distribuição' },
    { vehicleIdx: 2, tipo: 'manutencao', valor: 400.00, data: daysAgo(150), descricao: 'Pneus' },
    { vehicleIdx: 2, tipo: 'combustivel', valor: 110.00, data: daysAgo(100), descricao: 'Abastecimento' },
    { vehicleIdx: 2, tipo: 'manutencao', valor: 480.00, data: daysAgo(45),  descricao: 'Bomba de água' },
    { vehicleIdx: 2, tipo: 'manutencao', valor: 720.00, data: daysAgo(10),  descricao: 'Caixa de direção' },

    { vehicleIdx: 3, tipo: 'manutencao', valor: 198.00, data: daysAgo(200), descricao: 'Revisão + filtros' },
    { vehicleIdx: 3, tipo: 'combustivel', valor: 95.00,  data: daysAgo(160), descricao: 'Abastecimento' },
    { vehicleIdx: 3, tipo: 'manutencao', valor: 310.00, data: daysAgo(80),  descricao: 'Discos + pastilhas' },
    { vehicleIdx: 3, tipo: 'combustivel', valor: 88.00,  data: daysAgo(40),  descricao: 'Abastecimento' },

    { vehicleIdx: 4, tipo: 'manutencao', valor: 145.00, data: daysAgo(50),  descricao: '1.ª Revisão anual' },
    { vehicleIdx: 4, tipo: 'combustivel', valor: 42.00,  data: daysAgo(30),  descricao: 'Abastecimento' },
  ];

  for (const def of expenseDefs) {
    await Expense.create({ vehicleId: vehicles[def.vehicleIdx]._id, tipo: def.tipo, valor: def.valor, data: def.data, descricao: def.descricao });
  }
  console.log(`  ✓ ${expenseDefs.length} expenses created`);

  // ── Revenues ──────────────────────────────────────────────────────────────
  console.log('Creating revenues...');
  const revenueDefs = [
    { vehicleIdx: 0, tipo: 'servico', valor: 320.50, data: daysAgo(150), descricao: 'Fev — renda mensal' },
    { vehicleIdx: 0, tipo: 'servico', valor: 320.50, data: daysAgo(120), descricao: 'Mar — renda mensal' },
    { vehicleIdx: 0, tipo: 'servico', valor: 320.50, data: daysAgo(90),  descricao: 'Abr — renda mensal' },
    { vehicleIdx: 0, tipo: 'servico', valor: 320.50, data: daysAgo(60),  descricao: 'Mai — renda mensal' },
    { vehicleIdx: 0, tipo: 'servico', valor: 320.50, data: daysAgo(30),  descricao: 'Jun — renda mensal' },

    { vehicleIdx: 1, tipo: 'servico', valor: 245.00, data: daysAgo(120), descricao: 'Mar — renda mensal' },
    { vehicleIdx: 1, tipo: 'servico', valor: 245.00, data: daysAgo(90),  descricao: 'Abr — renda mensal' },
    { vehicleIdx: 1, tipo: 'servico', valor: 245.00, data: daysAgo(60),  descricao: 'Mai — renda mensal' },
    { vehicleIdx: 1, tipo: 'servico', valor: 245.00, data: daysAgo(30),  descricao: 'Jun — renda mensal' },

    { vehicleIdx: 2, tipo: 'servico', valor: 410.00, data: daysAgo(150), descricao: 'Fev — renda mensal' },
    { vehicleIdx: 2, tipo: 'servico', valor: 410.00, data: daysAgo(120), descricao: 'Mar — renda mensal' },
    { vehicleIdx: 2, tipo: 'servico', valor: 410.00, data: daysAgo(90),  descricao: 'Abr — renda mensal' },

    { vehicleIdx: 3, tipo: 'servico', valor: 378.00, data: daysAgo(90),  descricao: 'Abr — renda mensal' },
    { vehicleIdx: 3, tipo: 'servico', valor: 378.00, data: daysAgo(60),  descricao: 'Mai — renda mensal' },
    { vehicleIdx: 3, tipo: 'servico', valor: 378.00, data: daysAgo(30),  descricao: 'Jun — renda mensal' },
  ];

  for (const def of revenueDefs) {
    await Revenue.create({ vehicleId: vehicles[def.vehicleIdx]._id, tipo: def.tipo, valor: def.valor, data: def.data, descricao: def.descricao });
  }
  console.log(`  ✓ ${revenueDefs.length} revenues created`);

  // ── Schedules ─────────────────────────────────────────────────────────────
  console.log('Creating schedules...');
  const scheduleDefs = [
    { vehicleIdx: 1, tipoEvento: 'revisao',   dataInicio: daysAhead(12), notas: 'Revisão dos 35.000 km — marcar oficina' },
    { vehicleIdx: 2, tipoEvento: 'reparacao', dataInicio: daysAhead(2),  notas: 'Continuar reparação caixa de direção' },
    { vehicleIdx: 0, tipoEvento: 'inspecao',  dataInicio: daysAhead(45), notas: 'IPO obrigatório' },
    { vehicleIdx: 3, tipoEvento: 'manutencao',dataInicio: daysAhead(30), notas: 'Revisão + pneus traseiros' },
    { vehicleIdx: 4, tipoEvento: 'revisao',   dataInicio: daysAhead(60), notas: 'Revisão dos 15.000 km' },
  ];

  for (const def of scheduleDefs) {
    await Schedule.create({
      viaturaId: vehicles[def.vehicleIdx]._id,
      tipoEvento: def.tipoEvento,
      dataInicio: def.dataInicio,
      notas: def.notas,
    });
  }
  console.log(`  ✓ ${scheduleDefs.length} schedules created`);

  // ── Stock ─────────────────────────────────────────────────────────────────
  console.log('Creating stock items...');
  const stockItems = [
    { categoria: 'pneus',   nome: 'Pneu 205/55 R16',           quantidade: 8,  minimo: 4,  fornecedor: 'Continental',   preco: 85.00  },
    { categoria: 'pneus',   nome: 'Pneu 225/75 R16',           quantidade: 2,  minimo: 4,  fornecedor: 'Michelin',      preco: 110.00 },
    { categoria: 'filtros', nome: 'Filtro de óleo universal',   quantidade: 12, minimo: 5,  fornecedor: 'Bosch',         preco: 8.50   },
    { categoria: 'filtros', nome: 'Filtro de ar',               quantidade: 6,  minimo: 4,  fornecedor: 'Mann',          preco: 14.00  },
    { categoria: 'oleo',    nome: 'Óleo Motor 5W30 (5L)',       quantidade: 10, minimo: 6,  fornecedor: 'Castrol',       preco: 35.00  },
    { categoria: 'travoes', nome: 'Pastilhas travão dianteiras',quantidade: 3,  minimo: 4,  fornecedor: 'Brembo',        preco: 42.00  },
    { categoria: 'travoes', nome: 'Discos travão dianteiros',   quantidade: 2,  minimo: 2,  fornecedor: 'Zimmermann',    preco: 65.00  },
    { categoria: 'baterias',nome: 'Bateria 12V 74Ah',           quantidade: 1,  minimo: 2,  fornecedor: 'Varta',         preco: 95.00  },
    { categoria: 'lampadas',nome: 'Lâmpada H7 55W',             quantidade: 20, minimo: 8,  fornecedor: 'Osram',         preco: 6.50   },
    { categoria: 'outros',  nome: 'Líquido travões DOT4 (0.5L)',quantidade: 5,  minimo: 3,  fornecedor: 'ATE',           preco: 7.00   },
  ];

  for (const item of stockItems) {
    const exists = await StockItem.findOne({ nome: item.nome });
    if (!exists) await StockItem.create(item);
  }
  console.log(`  ✓ ${stockItems.length} stock items created`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────');
  console.log('Test data created successfully!');
  console.log(`  Fleet  : Test Fleet`);
  console.log(`  Vehicles : ${vehicles.length}`);
  console.log(`  Expenses : ${expenseDefs.length}`);
  console.log(`  Revenues : ${revenueDefs.length}`);
  console.log(`  Schedules: ${scheduleDefs.length}`);
  console.log(`  Stock    : ${stockItems.length} items`);
  console.log('─────────────────────────────────────────────────');
  process.exit(0);
}

run().catch(err => { console.error(err.message); process.exit(1); });

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Fleet = require('./models/Fleet');
const Vehicle = require('./models/Vehicle');

const DATA_DIR = path.join(__dirname, '../data');

// ── Find an Excel file by keyword in filename ─────────────────────────────────
function findExcelFile(keyword) {
  const files = fs.readdirSync(DATA_DIR).filter(f =>
    (f.endsWith('.xlsx') || f.endsWith('.xls')) && f.toLowerCase().includes(keyword.toLowerCase())
  );
  if (files.length === 0) throw new Error(`No .xlsx file matching "${keyword}" found in ${DATA_DIR}`);
  return path.join(DATA_DIR, files[0]);
}

// ── Read the first sheet of a workbook ───────────────────────────────────────
function readFirstSheet(wb) {
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' });
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function normalizeMatricula(str) {
  if (!str) return null;
  return str.toString().trim().replace(/\s+/g, '').toUpperCase();
}

const SKIP_VALUES = new Set(['n.d.', 'n.d', '#ref!', 'garantia', 'data', 'kms', 'avaria', 'factura', '#value!', '#n/a']);
function isSkip(s) {
  if (!s && s !== 0) return true;
  const low = s.toString().toLowerCase().trim();
  return low === '' || SKIP_VALUES.has(low) || /^_+/.test(low) || /^-+$/.test(low);
}

function parseDate(val) {
  if (val === null || val === undefined || val === '') return null;

  // xlsx with raw:false returns dates as "DD/MM/YYYY" strings or Excel serial numbers as strings
  const str = val.toString().trim();
  if (!str || isSkip(str)) return null;

  // Fix 5+ digit year: "16/03/20243" → "16/03/2024"
  const fixedStr = str.replace(/([\d]{1,2}[\/\-][\d]{1,2}[\/\-])([\d]{5,})/, (_, p, y) => p + y.slice(0, 4));

  // Skip 3-digit year like "29/04/026"
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{3}$/.test(fixedStr)) return null;

  const m = fixedStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!m) return null;

  let [, a, b, y] = m;
  let d, mo;
  const ai = parseInt(a), bi = parseInt(b);

  if (ai > 12)      { d = a; mo = b; }  // day is clearly first
  else if (bi > 12) { mo = a; d = b; }  // US format: month first
  else              { d = a; mo = b; }  // default Portuguese: DD/MM

  if (y.length === 2) y = parseInt(y) < 50 ? '20' + y : '19' + y;

  const date = new Date(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00Z`);
  return isNaN(date.getTime()) ? null : date;
}

function parseKm(val) {
  if (val === null || val === undefined || val === '') return null;
  let str = val.toString().trim();
  if (!str || isSkip(str)) return null;
  str = str.replace(/^~/, '').replace(/\s/g, '');
  const n = parseFloat(str.replace(',', '.'));
  return isNaN(n) ? null : Math.round(n);
}

function parseCost(val) {
  if (val === null || val === undefined || val === '') return null;
  const str = val.toString().trim();
  if (!str || isSkip(str)) return null;
  if (/garantia|franquia faturada/i.test(str)) return 0;
  const n = parseFloat(str.replace(',', '.'));
  return isNaN(n) ? null : n;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const viaturasPath = findExcelFile('viatura');
  const manutPath    = findExcelFile('manut');

  console.log(`Viaturas file : ${path.basename(viaturasPath)}`);
  console.log(`Manutenção file: ${path.basename(manutPath)}\n`);

  const viaturasRows = readFirstSheet(XLSX.readFile(viaturasPath, { raw: false, defval: '' }));
  const manutRows    = readFirstSheet(XLSX.readFile(manutPath,    { raw: false, defval: '' }));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Only clear EEM data — preserves all other fleets
  const existingEEM = await Fleet.findOne({ name: 'EEM' });
  if (existingEEM) {
    await Vehicle.deleteMany({ frotaId: existingEEM._id });
    await Fleet.deleteOne({ _id: existingEEM._id });
    console.log('Cleared existing EEM fleet and vehicles\n');
  }

  const fleet = await Fleet.create({ name: 'EEM', description: 'Empresa de Eletricidade Madeira' });
  console.log(`Fleet created: EEM (${fleet._id})\n`);

  // ── Build maintenance map: normalizedMatricula → records[] ─────────────────
  const manutMap = {};

  for (const row of manutRows.slice(1)) { // skip header
    const mat = normalizeMatricula(row[0]);
    if (!mat || mat.startsWith('_') || /^-+$/.test(mat)) continue;

    const records = [];
    // After col 0: groups of 4 → data | kms | avaria | factura
    for (let i = 1; i + 3 <= row.length; i += 4) {
      const descricao = row[i + 2]?.toString().trim();
      if (!descricao || isSkip(descricao)) continue;

      const data = parseDate(row[i]);
      const kms = parseKm(row[i + 1]);
      const custo = parseCost(row[i + 3]);

      if (!data && !kms) continue;

      records.push({
        data: data || new Date(0),
        kms,
        descricao,
        custo: custo ?? 0,
        oficina: '',
        materiaisUsados: [],
      });
    }

    if (records.length) manutMap[mat] = records;
  }

  const totalRecords = Object.values(manutMap).reduce((s, r) => s + r.length, 0);
  console.log(`Maintenance parsed: ${Object.keys(manutMap).length} vehicles, ${totalRecords} records\n`);

  // ── Insert vehicles ────────────────────────────────────────────────────────
  let count = 0;
  const warnings = [];

  for (const row of viaturasRows.slice(1)) { // skip header
    const matricula = normalizeMatricula(row[2]);
    if (!matricula) continue;

    const historicoManutencao = manutMap[matricula] || [];
    if (!manutMap[matricula]) warnings.push(`⚠  No maintenance data: ${matricula}`);

    try {
      await Vehicle.create({
        frotaId: fleet._id,
        matricula,
        modelo: row[4]?.toString().trim() || 'Desconhecido',
        dataEntrega: parseDate(row[1]),
        dataMatricula: parseDate(row[3]),
        numeroContrato: row[0]?.toString().trim() || undefined,
        rentabilidade: parseCost(row[5]),
        proximaRevisao: parseDate(row[6]),
        validadeContrato: parseDate(row[7]),
        intervaloRevisao: parseKm(row[8]),
        kmsUltimaRevisao: parseKm(row[9]),
        km: parseKm(row[10]) ?? 0,
        status: 'Operacional',
        historicoManutencao,
      });

      console.log(`  ✓ ${matricula.padEnd(12)} | ${historicoManutencao.length.toString().padStart(2)} registos | ${(row[4] || '').toString().trim().slice(0, 45)}`);
      count++;
    } catch (err) {
      console.error(`  ✗ ${matricula}: ${err.message}`);
    }
  }

  if (warnings.length) {
    console.log('\n' + warnings.join('\n'));
  }

  console.log(`\n─────────────────────────────────────────────────`);
  console.log(`Import complete: ${count} vehicles added to fleet EEM`);
  console.log(`─────────────────────────────────────────────────`);
  process.exit(0);
}

run().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});

const Vehicle = require('../models/Vehicle');

// Returns null if the user has unrestricted access (sees every fleet),
// or an array of allowed Fleet id strings otherwise.
function allowedFleetIds(user) {
  if (!user.allowedFleets || user.allowedFleets.length === 0) return null;
  return user.allowedFleets.map((id) => id.toString());
}

function isFleetAllowed(user, fleetId) {
  const allowed = allowedFleetIds(user);
  if (allowed === null) return true;
  return !!fleetId && allowed.includes(fleetId.toString());
}

// Mongo filter fragment to scope a Fleet query.
function fleetFilter(user) {
  const allowed = allowedFleetIds(user);
  return allowed === null ? {} : { _id: { $in: allowed } };
}

// Mongo filter fragment to scope a Vehicle query.
function vehicleFleetFilter(user) {
  const allowed = allowedFleetIds(user);
  return allowed === null ? {} : { frotaId: { $in: allowed } };
}

// Returns null (unrestricted) or an array of allowed Vehicle id strings.
// Used to scope Expense/Revenue/Schedule queries, which reference a vehicle rather than a fleet directly.
async function allowedVehicleIds(user) {
  const allowed = allowedFleetIds(user);
  if (allowed === null) return null;
  const vehicles = await Vehicle.find({ frotaId: { $in: allowed } }).select('_id');
  return vehicles.map((v) => v._id.toString());
}

// Looks up a vehicle's fleet and checks it against the user's allow-list.
async function isVehicleAllowed(user, vehicleId) {
  const allowed = allowedFleetIds(user);
  if (allowed === null) return true;
  if (!vehicleId) return false;
  const vehicle = await Vehicle.findById(vehicleId).select('frotaId');
  if (!vehicle) return false;
  return allowed.includes(vehicle.frotaId.toString());
}

// Mongo filter fragment to scope a StockItem query (items with ANY overlapping fleet are visible).
function stockFilter(user) {
  const allowed = allowedFleetIds(user);
  return allowed === null ? {} : { frotaIds: { $in: allowed } };
}

// Checks whether a stock item's frotaIds overlap the user's allow-list.
function isStockAllowed(user, frotaIds) {
  const allowed = allowedFleetIds(user);
  if (allowed === null) return true;
  if (!frotaIds || frotaIds.length === 0) return false;
  return frotaIds.some((id) => allowed.includes(id.toString()));
}

// Mongo filter fragment to scope a Log query. Entries with no frotaIds (legacy or fleet-agnostic
// actions) are excluded for restricted users — they're only visible to unrestricted ones.
function logFilter(user) {
  const allowed = allowedFleetIds(user);
  return allowed === null ? {} : { frotaIds: { $in: allowed } };
}

module.exports = {
  allowedFleetIds,
  isFleetAllowed,
  fleetFilter,
  vehicleFleetFilter,
  allowedVehicleIds,
  isVehicleAllowed,
  stockFilter,
  isStockAllowed,
  logFilter,
};

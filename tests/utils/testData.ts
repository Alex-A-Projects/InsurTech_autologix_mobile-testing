/**
 * tests/utils/testData.ts
 *
 * Factories for ephemeral test data. Each call produces a fresh value so
 * concurrent spec files never collide.
 */

const POLISH_BRANDS = [
  'Volkswagen', 'Toyota', 'BMW', 'Audi', 'Ford',
  'Porsche', 'Honda', 'Opel', 'Skoda'
] as const;

const MODELS: Record<string, readonly string[]> = {
  Volkswagen: ['Golf', 'Passat', 'Tiguan'],
  Toyota:     ['Corolla', 'Yaris', 'RAV4'],
  BMW:        ['320i', 'X5', 'i3'],
  Audi:       ['A4', 'A6', 'Q5'],
  Ford:       ['Focus', 'Mondeo', 'Kuga'],
  Porsche:    ['911', 'Cayenne', 'Panamera'],
  Honda:      ['Civic', 'CR-V', 'Jazz'],
  Opel:       ['Astra', 'Insignia', 'Corsa'],
  Skoda:      ['Octavia', 'Fabia', 'Superb']
};

const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'LPG', 'Electric'] as const;

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

export const uniqueEmail = (prefix = 'qa'): string =>
  `${prefix}+${Date.now()}-${Math.random().toString(36).slice(2, 8)}@autologix.test`;

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const randomPlate = (): string => {
  const pickL = () => LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${pickL()}${pickL()}${pickL()} ${num}${pickL()}`;
};

export const randomVin = (): string =>
  Array.from({ length: 17 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');

export const isoNow = (): string => new Date().toISOString();

export const futureDateIso = (days: number): string => {
  const d = new Date(Date.now() + days * 86_400_000);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

export const pastDateIso = (days: number): string => {
  const d = new Date(Date.now() - days * 86_400_000);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
};

export interface VehicleDraft {
  brand: string;
  model: string;
  version: string;
  registrationNumber: string;
  vin?: string;
  year: number;
  mileage: number;
  fuelType: string;
  engineCapacity: number;
  enginePowerHp: number;
  firstRegistrationDate: string;
  notes: string;
  allowInsuranceOffers: boolean;
}

export const makeVehicle = (over: Partial<VehicleDraft> = {}): VehicleDraft => {
  const brand = over.brand ?? pick(POLISH_BRANDS);
  const model = over.model ?? pick((MODELS as Record<string, readonly string[]>)[brand] ?? ['Unknown']);
  return {
    brand,
    model,
    version: over.version ?? 'Comfortline',
    registrationNumber: over.registrationNumber ?? randomPlate(),
    vin: over.vin ?? randomVin(),
    year: over.year ?? 2015 + Math.floor(Math.random() * 9),
    mileage: over.mileage ?? 10_000 + Math.floor(Math.random() * 200_000),
    fuelType: over.fuelType ?? pick(FUELS),
    engineCapacity: over.engineCapacity ?? 1000 + Math.floor(Math.random() * 3000),
    enginePowerHp: over.enginePowerHp ?? 90 + Math.floor(Math.random() * 300),
    firstRegistrationDate: over.firstRegistrationDate ?? pastDateIso(365 * 5),
    notes: over.notes ?? 'Created by automated mobile test',
    allowInsuranceOffers: over.allowInsuranceOffers ?? true
  };
};

export const makeOffer = (over: Partial<{ price: number; description: string; coverageMonths: number }> = {}) => ({
  price: over.price ?? Math.round(1200 + Math.random() * 800),
  description: over.description ?? 'Insurance offer from automated test',
  coverageMonths: over.coverageMonths ?? 12
});

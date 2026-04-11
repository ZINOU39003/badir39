export interface CivilProtectionUnit {
  id: string;
  name: string;
  municipality: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
}

export const CIVIL_PROTECTION_UNITS: CivilProtectionUnit[] = [
  {
    id: "unit-1",
    name: "وحدة الحماية المدنية - الوادي (وسط المدينة)",
    municipality: "بلدية الوادي",
    phone: "032123456",
    lat: 33.3667,
    lng: 6.8500,
    address: "وسط مدينة الوادي، مقابل مقر الولاية"
  },
  {
    id: "unit-2",
    name: "وحدة الحماية المدنية - قمار",
    municipality: "بلدية قمار",
    phone: "032123457",
    lat: 33.4500,
    lng: 6.8167,
    address: "المدخل الجنوبي لبلدية قمار"
  },
  {
    id: "unit-3",
    name: "وحدة الحماية المدنية - الدبيلة",
    municipality: "بلدية الدبيلة",
    phone: "032123458",
    lat: 33.3500,
    lng: 6.9500,
    address: "الطريق الوطني رقم 16، الدبيلة"
  },
  {
    id: "unit-4",
    name: "وحدة الحماية المدنية - المقرن",
    municipality: "بلدية المقرن",
    phone: "032123459",
    lat: 33.4333,
    lng: 6.9167,
    address: "وسط مدينة المقرن"
  },
  {
    id: "unit-5",
    name: "وحدة الحماية المدنية - جامعة",
    municipality: "بلدية جامعة",
    phone: "032123460",
    lat: 33.7167,
    lng: 6.0000,
    address: "وسط مدينة جامعة"
  }
];

export function getNearestUnit(municipalityName: string): CivilProtectionUnit | undefined {
  const cleanName = municipalityName.replace("بلدية", "").trim();
  return CIVIL_PROTECTION_UNITS.find(u => 
    u.municipality.includes(cleanName) || cleanName.includes(u.municipality.replace("بلدية", "").trim())
  ) || CIVIL_PROTECTION_UNITS[0]; // Fallback to main unit
}

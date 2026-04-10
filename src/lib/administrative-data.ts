export interface AdministrativeSector {
  id: string;
  name: string;
  logo: string;
}

export interface Municipality {
  id: string;
  name: string;
}

export interface District {
  id: string;
  name: string;
  municipalities: Municipality[];
}

export const STANDARD_SECTORS: AdministrativeSector[] = [
  { id: "water", name: "الموارد المائية (ADE)", logo: "/logos/water.png" },
  { id: "energy", name: "الطاقة والكهرباء (Sonelgaz)", logo: "/logos/energy.png" },
  { id: "sanitation", name: "التطهير والنظافة (ONA)", logo: "/logos/sanitation.png" },
  { id: "roads", name: "الأشغال العمومية والطرق", logo: "/logos/roads.png" },
  { id: "health", name: "الصحة والسكان", logo: "/logos/health.png" },
  { id: "education", name: "التربية والتعليم", logo: "/logos/education.png" },
  { id: "housing", name: "السكن والتجهيزات العمومية", logo: "/logos/housing.png" },
  { id: "environment", name: "البيئة والمساحات الخضراء", logo: "/logos/environment.png" },
  { id: "trade", name: "التجارة وترقية الصادرات", logo: "/logos/trade.png" },
  { id: "security", name: "الأمن الوطني", logo: "/logos/security.png" },
  { id: "civil_protection", name: "الحماية المدنية", logo: "/logos/protection.png" },
  { id: "transport", name: "النقل والمواصلات", logo: "/logos/transport.png" },
  { id: "social", name: "النشاط الاجتماعي", logo: "/logos/social.png" },
  { id: "youth", name: "الشباب والرياضة", logo: "/logos/youth.png" },
  { id: "lighting", name: "الإنارة العمومية", logo: "/logos/lighting.png" },
];

export const WILAYA_STRUCTURE: District[] = [
  {
    id: "el-oued",
    name: "دائرة الوادي (مقر الولاية)",
    municipalities: [
      { id: "m-1", name: "بلدية الوادي" },
      { id: "m-2", name: "بلدية كوينين" },
    ],
  },
  {
    id: "bayadha",
    name: "دائرة البياضة",
    municipalities: [
      { id: "m-3", name: "بلدية البياضة" },
    ],
  },
  {
    id: "guemar",
    name: "دائرة قمار",
    municipalities: [
      { id: "m-4", name: "بلدية قمار" },
      { id: "m-5", name: "بلدية تغزوت" },
      { id: "m-6", name: "بلدية ورماس" },
    ],
  },
  {
    id: "debila",
    name: "دائرة الدبيلة",
    municipalities: [
      { id: "m-7", name: "بلدية الدبيلة" },
      { id: "m-8", name: "بلدية حساني عبد الكريم" },
    ],
  },
  {
    id: "reguiba",
    name: "دائرة الرقيبة",
    municipalities: [
      { id: "m-9", name: "بلدية الرقيبة" },
      { id: "m-10", name: "بلدية الحمراية" },
    ],
  },
  {
    id: "magrane",
    name: "دائرة المقرن",
    municipalities: [
      { id: "m-11", name: "بلدية المقرن" },
      { id: "m-12", name: "بلدية سيدي عون" },
    ],
  },
  {
    id: "hassi-khelifa",
    name: "دائرة حاسي خليفة",
    municipalities: [
      { id: "m-13", name: "بلدية حاسي خليفة" },
      { id: "m-14", name: "بلدية الطريفاوي" },
    ],
  },
  {
    id: "taleb-larbi",
    name: "دائرة الطالب العربي",
    municipalities: [
      { id: "m-15", name: "بلدية الطالب العربي" },
      { id: "m-16", name: "بلدية دوار الماء" },
      { id: "m-17", name: "بلدية بن قشة" },
    ],
  },
  {
    id: "robhah",
    name: "دائرة الرباح",
    municipalities: [
      { id: "m-18", name: "بلدية الرباح" },
      { id: "m-19", name: "بلدية النخلة" },
      { id: "m-20", name: "بلدية العقلة" },
    ],
  },
  {
    id: "oume-ouensa",
    name: "دائرة أميه ونسة",
    municipalities: [
      { id: "m-21", name: "بلدية أميه ونسة" },
      { id: "m-22", name: "بلدية وادي العلندة" },
    ],
  },
];

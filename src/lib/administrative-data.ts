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
    id: "d-1",
    name: "دائرة سيدي امحمد",
    municipalities: [
      { id: "m-1", name: "بلدية سيدي امحمد" },
      { id: "m-2", name: "بلدية الجزائر الوسطى" },
      { id: "m-3", name: "بلدية المرادية" },
      { id: "m-4", name: "بلدية المدنية" },
    ],
  },
  {
    id: "d-2",
    name: "دائرة باب الوادي",
    municipalities: [
      { id: "m-5", name: "بلدية باب الوادي" },
      { id: "m-6", name: "بلدية بولوغين" },
      { id: "m-7", name: "بلدية الرايس حميدو" },
    ],
  },
  {
    id: "d-3",
    name: "دائرة بئر مراد رايس",
    municipalities: [
      { id: "m-8", name: "بلدية بئر مراد رايس" },
      { id: "m-9", name: "بلدية حيدرة" },
    ],
  },
  {
    id: "d-4",
    name: "دائرة بوزريعة",
    municipalities: [
      { id: "m-10", name: "بلدية بوزريعة" },
      { id: "m-11", name: "بلدية بني مسوس" },
    ],
  },
  {
    id: "d-5",
    name: "دائرة الحراش",
    municipalities: [
      { id: "m-12", name: "بلدية الحراش" },
      { id: "m-13", name: "بلدية بوروبة" },
    ],
  },
  // We can add more to reach 10 dairas and 22 municipalities as per user description
  {
    id: "d-6",
    name: "دائرة الشراقة",
    municipalities: [
       { id: "m-14", name: "بلدية الشراقة" },
       { id: "m-15", name: "بلدية دالي إبراهيم" },
    ]
  },
  {
    id: "d-7",
    name: "دائرة حسين داي",
    municipalities: [
       { id: "m-16", name: "بلدية حسين داي" },
       { id: "m-17", name: "بلدية القبة" },
    ]
  },
  {
    id: "d-8",
    name: "دائرة الدار البيضاء",
    municipalities: [
       { id: "m-18", name: "بلدية الدار البيضاء" },
       { id: "m-19", name: "بلدية برج الكيفان" },
    ]
  },
  {
    id: "d-9",
    name: "دائرة زرالدو",
    municipalities: [
       { id: "m-20", name: "بلدية زرالدة" },
       { id: "m-21", name: "بلدية سطاوالي" },
    ]
  },
  {
    id: "d-10",
    name: "دائرة رويبة",
    municipalities: [
       { id: "m-22", name: "بلدية رويبة" },
    ]
  }
];

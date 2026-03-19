// Dữ liệu & Định nghĩa dùng chung cho ProductManager
export interface ProductFormData {
  productName: string;
  description: string;
  basePrice: number;
  status: number;
  sku: string;
  productType: string;
  categoryId: number;
  brandId: number;
  specifications: string;

  // Lens Specs
  designType: string;
  rxLensMaterial: string;
  lensWidth: number;
  minSphere: number;
  maxSphere: number;
  minCylinder: number;
  maxCylinder: number;
  minAxis: number;
  maxAxis: number;
  minAdd: number;
  maxAdd: number;
  hasAntiReflective: boolean;
  hasBlueLightFilter: boolean;
  hasUVProtection: boolean;
  hasScratchResistant: boolean;

  // Frame Specs
  rimType: string;
  frameMaterial: string;
  shape: string;
  weight: number;
  a: number;
  b: number;
  dbl: number;
  templeLength: number;
  frameLensWidth: number;
  hingeType: string;
  hasNosePads: boolean;

  // Contact Lens Specs
  baseCurve: number;
  diameter: number;
  lensType: string;
  waterContent: number;
  oxygenPermeability: number;
  replacementSchedule: number;
  isToric: boolean;
  isMultifocal: boolean;
}

export const categoryList = [
  { id: 1, name: "Sunglasses" },
  { id: 2, name: "Eyeglasses" },
  { id: 3, name: "Reading Glasses" },
  { id: 4, name: "Contact Lenses" }
];

export const brandList = [
  { id: 1, name: "Ray-Ban" },
  { id: 2, name: "Oakley" },
  { id: 3, name: "Gucci" },
  { id: 4, name: "Tom Ford" },
  { id: 5, name: "Essilor" },
  { id: 6, name: "Zeiss" }
];

export const productTypeList = [
  { id: "SUNGLASSES", name: "Kính mát (Sunglasses)" },
  { id: "FRAME", name: "Gọng kính (Frame)" },
  { id: "RX_LENS", name: "Tròng kính (RxLens)" },
  { id: "CONTACT_LENS", name: "Kính áp tròng (Contact Lens)" },
  { id: "COMBO", name: "Kính mát & Tròng (Combo)" },
  { id: "OTHER", name: "Khác (Other)" }
];

export const getDefaultFormData = (): ProductFormData => ({
  productName: "", description: "", basePrice: 0, status: 1, sku: "", productType: "FRAME", categoryId: 1, brandId: 1, specifications: "",
  designType: "", rxLensMaterial: "", lensWidth: 0,
  minSphere: 0, maxSphere: 0, minCylinder: 0, maxCylinder: 0, minAxis: 0, maxAxis: 0, minAdd: 0, maxAdd: 0,
  hasAntiReflective: false, hasBlueLightFilter: false, hasUVProtection: false, hasScratchResistant: false,
  rimType: "", frameMaterial: "", shape: "", weight: 0, a: 0, b: 0, dbl: 0, templeLength: 0, frameLensWidth: 0, hingeType: "", hasNosePads: false,
  baseCurve: 0, diameter: 0, lensType: "", waterContent: 0, oxygenPermeability: 0, replacementSchedule: 0, isToric: false, isMultifocal: false
});

export const mapProductToFormData = (prod: any): ProductFormData => ({
  ...getDefaultFormData(),
  productName: prod.productName || "",
  description: prod.description || "",
  basePrice: prod.basePrice || 0,
  status: prod.status !== undefined ? prod.status : 1,
  sku: prod.sku || "",
  productType: prod.productType || "FRAME",
  categoryId: prod.category?.categoryId || prod.categoryId || 1,
  brandId: prod.brand?.brandId || prod.brandId || 1,
  specifications: prod.specifications || "",
  
  rimType: prod.spec?.rimType || prod.spec?.frameSpec?.rimType || "",
  shape: prod.spec?.shape || prod.spec?.frameSpec?.shape || "",
  frameMaterial: prod.spec?.material || prod.spec?.frameSpec?.material || prod.spec?.frameMaterial || "",
  weight: prod.spec?.weight || prod.spec?.frameSpec?.weight || 0,
  a: prod.spec?.a || prod.spec?.frameSpec?.a || 0,
  b: prod.spec?.b || prod.spec?.frameSpec?.b || 0,
  dbl: prod.spec?.dbl || prod.spec?.frameSpec?.dbl || 0,
  templeLength: prod.spec?.templeLength || prod.spec?.frameSpec?.templeLength || 0,
  frameLensWidth: prod.spec?.lensWidth || prod.spec?.frameSpec?.lensWidth || 0,
  hingeType: prod.spec?.hingeType || prod.spec?.frameSpec?.hingeType || "",
  hasNosePads: prod.spec?.hasNosePads ?? prod.spec?.frameSpec?.hasNosePads ?? false,

  designType: prod.spec?.designType || prod.spec?.rxLensSpec?.designType || "",
  rxLensMaterial: prod.spec?.material || prod.spec?.rxLensSpec?.material || prod.spec?.rxLensMaterial || "",
  lensWidth: prod.spec?.lensWidth || prod.spec?.rxLensSpec?.lensWidth || 0,
  
  minSphere: prod.spec?.minSphere ?? prod.spec?.rxLensSpec?.minSphere ?? 0,
  maxSphere: prod.spec?.maxSphere ?? prod.spec?.rxLensSpec?.maxSphere ?? 0,
  minCylinder: prod.spec?.minCylinder ?? prod.spec?.rxLensSpec?.minCylinder ?? 0,
  maxCylinder: prod.spec?.maxCylinder ?? prod.spec?.rxLensSpec?.maxCylinder ?? 0,
  minAxis: prod.spec?.minAxis ?? prod.spec?.rxLensSpec?.minAxis ?? 0,
  maxAxis: prod.spec?.maxAxis ?? prod.spec?.rxLensSpec?.maxAxis ?? 0,
  minAdd: prod.spec?.minAdd ?? prod.spec?.rxLensSpec?.minAdd ?? 0,
  maxAdd: prod.spec?.maxAdd ?? prod.spec?.rxLensSpec?.maxAdd ?? 0,
  
  hasAntiReflective: prod.spec?.hasAntiReflective ?? prod.spec?.rxLensSpec?.hasAntiReflective ?? false,
  hasBlueLightFilter: prod.spec?.hasBlueLightFilter ?? prod.spec?.rxLensSpec?.hasBlueLightFilter ?? false,
  hasUVProtection: prod.spec?.hasUVProtection ?? prod.spec?.rxLensSpec?.hasUVProtection ?? false,
  hasScratchResistant: prod.spec?.hasScratchResistant ?? prod.spec?.rxLensSpec?.hasScratchResistant ?? false,
  
  baseCurve: prod.spec?.baseCurve ?? 0,
  diameter: prod.spec?.diameter ?? 0,
  lensType: prod.spec?.lensType || "",
  waterContent: prod.spec?.waterContent ?? 0,
  oxygenPermeability: prod.spec?.oxygenPermeability ?? 0,
  replacementSchedule: prod.spec?.replacementSchedule ?? 0,
  isToric: prod.spec?.isToric ?? false,
  isMultifocal: prod.spec?.isMultifocal ?? false
});

export const prepareProductPayload = (p: ProductFormData) => {
  const basePayload = {
    productName: p.productName, 
    sku: p.sku, 
    description: p.description, 
    basePrice: Number(p.basePrice),
    categoryId: Number(p.categoryId), 
    brandId: Number(p.brandId), 
    productType: p.productType, 
    specifications: p.specifications
  };

  if (p.productType === "FRAME") {
    return { 
      ...basePayload, 
      rimType: p.rimType, 
      frameMaterial: p.frameMaterial, // Changed from material to frameMaterial
      shape: p.shape, 
      weight: Number(p.weight),
      a: Number(p.a), 
      b: Number(p.b), 
      dbl: Number(p.dbl), 
      templeLength: Number(p.templeLength),
      frameLensWidth: Number(p.frameLensWidth), 
      hingeType: p.hingeType, 
      hasNosePads: p.hasNosePads 
    };
  }
  if (p.productType === "COMBO" || p.productType === "SUNGLASSES") {
    return { 
      ...basePayload, 
      designType: p.designType, 
      rxLensMaterial: p.rxLensMaterial, 
      lensWidth: Number(p.lensWidth),
      minSphere: Number(p.minSphere), 
      maxSphere: Number(p.maxSphere), 
      minCylinder: Number(p.minCylinder), 
      maxCylinder: Number(p.maxCylinder),
      minAxis: Number(p.minAxis), 
      maxAxis: Number(p.maxAxis), 
      minAdd: Number(p.minAdd), 
      maxAdd: Number(p.maxAdd),
      hasAntiReflective: p.hasAntiReflective, 
      hasBlueLightFilter: p.hasBlueLightFilter, 
      hasUVProtection: p.hasUVProtection, 
      hasScratchResistant: p.hasScratchResistant,
      rimType: p.rimType, 
      frameMaterial: p.frameMaterial, 
      shape: p.shape, 
      weight: Number(p.weight),
      a: Number(p.a), 
      b: Number(p.b), 
      dbl: Number(p.dbl), 
      templeLength: Number(p.templeLength),
      frameLensWidth: Number(p.frameLensWidth), 
      hingeType: p.hingeType, 
      hasNosePads: p.hasNosePads 
    };
  }
  if (p.productType === "RX_LENS") {
    return { 
      ...basePayload, 
      designType: p.designType, 
      rxLensMaterial: p.rxLensMaterial, // Changed from material to rxLensMaterial
      lensWidth: Number(p.lensWidth),
      minSphere: Number(p.minSphere), 
      maxSphere: Number(p.maxSphere), 
      minCylinder: Number(p.minCylinder), 
      maxCylinder: Number(p.maxCylinder),
      minAxis: Number(p.minAxis), 
      maxAxis: Number(p.maxAxis), 
      minAdd: Number(p.minAdd), 
      maxAdd: Number(p.maxAdd),
      hasAntiReflective: p.hasAntiReflective, 
      hasBlueLightFilter: p.hasBlueLightFilter, 
      hasUVProtection: p.hasUVProtection, 
      hasScratchResistant: p.hasScratchResistant 
    };
  }
  if (p.productType === "CONTACT_LENS") {
    return { 
      ...basePayload, 
      baseCurve: Number(p.baseCurve), 
      diameter: Number(p.diameter), 
      lensType: p.lensType, 
      rxLensMaterial: p.rxLensMaterial, // Changed from material to rxLensMaterial
      minSphere: Number(p.minSphere), 
      maxSphere: Number(p.maxSphere), 
      minCylinder: Number(p.minCylinder), 
      maxCylinder: Number(p.maxCylinder),
      minAxis: Number(p.minAxis), 
      maxAxis: Number(p.maxAxis), 
      waterContent: Number(p.waterContent),
      oxygenPermeability: Number(p.oxygenPermeability), 
      replacementSchedule: Number(p.replacementSchedule),
      isToric: p.isToric, 
      isMultifocal: p.isMultifocal 
    };
  }
  return basePayload;
};

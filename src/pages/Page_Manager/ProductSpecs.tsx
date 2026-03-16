import React from 'react';
import './ProductSpecs.css';
import { ProductFormData } from './ProductManagerUtils';

interface ProductSpecsProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData) => void;
  isReadOnly: boolean;
}

const ProductSpecs: React.FC<ProductSpecsProps> = ({ formData, setFormData, isReadOnly }) => {
  const isFrameGroup = ["FRAME", "COMBO", "SUNGLASSES"].includes(formData.productType);
  const isLensGroup = ["RX_LENS", "COMBO", "SUNGLASSES"].includes(formData.productType);
  const isContactGroup = ["CONTACT_LENS"].includes(formData.productType);

  return (
    <div className="pm-specs-wrapper">
      {/* ==== THÔNG SỐ GỌNG KÍNH ==== */}
      {isFrameGroup && (
        <div className="pm-form-section pm-form-section--frame">
          <h4 className="pm-section-title-modern pm-section-title-modern--frame">👓 Thông Số Gọng Kính (Frame Specs)</h4>
          <div className="pm-form-grid-4">
            <div className="pm-form-group"><label>Rim Type</label><input disabled={isReadOnly} placeholder="Full Rim / Half Rim" value={formData.rimType} onChange={e => setFormData({...formData, rimType: e.target.value})} /></div>
            <div className="pm-form-group"><label>Shape</label><input disabled={isReadOnly} placeholder="Round / Square / Aviator" value={formData.shape} onChange={e => setFormData({...formData, shape: e.target.value})} /></div>
            <div className="pm-form-group"><label>Hinge Type</label><input disabled={isReadOnly} placeholder="Spring / Standard" value={formData.hingeType} onChange={e => setFormData({...formData, hingeType: e.target.value})} /></div>
            <div className="pm-form-group"><label>Frame Material</label><input disabled={isReadOnly} placeholder="Acetate / Titanium" value={formData.frameMaterial} onChange={e => setFormData({...formData, frameMaterial: e.target.value})} /></div>
            
            <div className="pm-form-group"><label>Frame Lens Width (mm)</label><input disabled={isReadOnly} type="number" value={formData.frameLensWidth} onChange={e => setFormData({...formData, frameLensWidth: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>Weight (g)</label><input disabled={isReadOnly} type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>Temple Length (mm)</label><input disabled={isReadOnly} type="number" value={formData.templeLength} onChange={e => setFormData({...formData, templeLength: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>DBL (Nose Bridge) (mm)</label><input disabled={isReadOnly} type="number" value={formData.dbl} onChange={e => setFormData({...formData, dbl: Number(e.target.value)})} /></div>
            
            <div className="pm-form-group"><label>A (Lens Width) (mm)</label><input disabled={isReadOnly} type="number" value={formData.a} onChange={e => setFormData({...formData, a: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>B (Lens Height) (mm)</label><input disabled={isReadOnly} type="number" value={formData.b} onChange={e => setFormData({...formData, b: Number(e.target.value)})} /></div>
            <div className="pm-form-group pm-col-span-2">
               <label className="pm-form-group-checkbox pm-nosepads-wrapper">
                 <input disabled={isReadOnly} type="checkbox" checked={formData.hasNosePads} onChange={e => setFormData({...formData, hasNosePads: e.target.checked})} />
                 Có Đệm Mũi (Has Nose Pads)
               </label>
            </div>
          </div>
        </div>
      )}

      {/* ==== THÔNG SỐ TRÒNG CẬN / MÁT ==== */}
      {isLensGroup && (
        <div className="pm-form-section pm-form-section--lens">
          <h4 className="pm-section-title-modern pm-section-title-modern--lens">🥽 Thông Số Tròng Kính (Lens Specs)</h4>
          <div className="pm-form-grid-4">
            <div className="pm-form-group"><label>Design Type</label><input disabled={isReadOnly} placeholder="Single Vision / Progressive" value={formData.designType} onChange={e => setFormData({...formData, designType: e.target.value})} /></div>
            <div className="pm-form-group"><label>RxLens Material</label><input disabled={isReadOnly} placeholder="Polycarbonate / Trivex" value={formData.rxLensMaterial} onChange={e => setFormData({...formData, rxLensMaterial: e.target.value})} /></div>
            <div className="pm-form-group"><label>Lens Width (mm)</label><input disabled={isReadOnly} type="number" value={formData.lensWidth} onChange={e => setFormData({...formData, lensWidth: Number(e.target.value)})} /></div>
            <div className="pm-form-group"></div> {/* Empty spacer */}

            <div className="pm-form-group">
              <label>Sphere (Độ cận/viễn)</label>
              <div className="min-max-group">
                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minSphere} onChange={e => setFormData({...formData, minSphere: Number(e.target.value)})} />
                <span>~</span>
                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxSphere} onChange={e => setFormData({...formData, maxSphere: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pm-form-group">
              <label>Cylinder (Độ loạn)</label>
              <div className="min-max-group">
                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minCylinder} onChange={e => setFormData({...formData, minCylinder: Number(e.target.value)})} />
                <span>~</span>
                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxCylinder} onChange={e => setFormData({...formData, maxCylinder: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pm-form-group">
              <label>Axis (Trục loạn)</label>
              <div className="min-max-group">
                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAxis} onChange={e => setFormData({...formData, minAxis: Number(e.target.value)})} />
                <span>~</span>
                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAxis} onChange={e => setFormData({...formData, maxAxis: Number(e.target.value)})} />
              </div>
            </div>
            <div className="pm-form-group">
              <label>Add (Độ đọc chữ)</label>
              <div className="min-max-group">
                <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAdd} onChange={e => setFormData({...formData, minAdd: Number(e.target.value)})} />
                <span>~</span>
                <input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAdd} onChange={e => setFormData({...formData, maxAdd: Number(e.target.value)})} />
              </div>
            </div>

            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasAntiReflective} onChange={e => setFormData({...formData, hasAntiReflective: e.target.checked})} /> Chống Lóa (A/R)</label>
            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasBlueLightFilter} onChange={e => setFormData({...formData, hasBlueLightFilter: e.target.checked})} /> Lọc Ánh Sáng Xanh</label>
            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasUVProtection} onChange={e => setFormData({...formData, hasUVProtection: e.target.checked})} /> Chống Tia UV</label>
            <label className="pm-form-group-checkbox"><input disabled={isReadOnly} type="checkbox" checked={formData.hasScratchResistant} onChange={e => setFormData({...formData, hasScratchResistant: e.target.checked})} /> Chống Trầy Xước</label>
          </div>
        </div>
      )}

      {/* ==== THÔNG SỐ KÍNH ÁP TRÒNG ==== */}
      {isContactGroup && (
        <div className="pm-form-section pm-form-section--contact">
          <h4 className="pm-section-title-modern pm-section-title-modern--contact">👁️ Thông Số Kính Áp Tròng (Contact Lens Specs)</h4>
          <div className="pm-form-grid-4">
            <div className="pm-form-group"><label>Lens Type</label><input disabled={isReadOnly} placeholder="Soft / Hard" value={formData.lensType} onChange={e => setFormData({...formData, lensType: e.target.value})} /></div>
            <div className="pm-form-group"><label>Material (Chất liệu)</label><input disabled={isReadOnly} placeholder="Silicone Hydrogel" value={formData.rxLensMaterial} onChange={e => setFormData({...formData, rxLensMaterial: e.target.value})} /></div>
            <div className="pm-form-group"><label>Base Curve (Độ cong)</label><input disabled={isReadOnly} type="number" step="0.01" value={formData.baseCurve} onChange={e => setFormData({...formData, baseCurve: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>Diameter (Đường kính)</label><input disabled={isReadOnly} type="number" step="0.01" value={formData.diameter} onChange={e => setFormData({...formData, diameter: Number(e.target.value)})} /></div>
            
            <div className="pm-form-group"><label>Water Content (%)</label><input disabled={isReadOnly} type="number" step="1" value={formData.waterContent} onChange={e => setFormData({...formData, waterContent: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>Oxygen Permeability</label><input disabled={isReadOnly} type="number" step="1" value={formData.oxygenPermeability} onChange={e => setFormData({...formData, oxygenPermeability: Number(e.target.value)})} /></div>
            <div className="pm-form-group"><label>Replacement (Days)</label><input disabled={isReadOnly} type="number" step="1" value={formData.replacementSchedule} onChange={e => setFormData({...formData, replacementSchedule: Number(e.target.value)})} /></div>
            <div className="pm-form-group"></div>

             <div className="pm-form-group">
               <label>Sphere (Độ cận/viễn)</label>
               <div className="min-max-group">
                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minSphere} onChange={e => setFormData({...formData, minSphere: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxSphere} onChange={e => setFormData({...formData, maxSphere: Number(e.target.value)})} />
               </div>
             </div>
             <div className="pm-form-group">
               <label>Cylinder (Độ loạn)</label>
               <div className="min-max-group">
                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minCylinder} onChange={e => setFormData({...formData, minCylinder: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxCylinder} onChange={e => setFormData({...formData, maxCylinder: Number(e.target.value)})} />
               </div>
             </div>
             <div className="pm-form-group">
               <label>Axis (Trục loạn)</label>
               <div className="min-max-group">
                 <input disabled={isReadOnly} type="number" placeholder="Min" value={formData.minAxis} onChange={e => setFormData({...formData, minAxis: Number(e.target.value)})} /><span>~</span><input disabled={isReadOnly} type="number" placeholder="Max" value={formData.maxAxis} onChange={e => setFormData({...formData, maxAxis: Number(e.target.value)})} />
               </div>
             </div>
             <div className="pm-form-group">
               <label className="pm-form-group-checkbox pm-checkbox-group--inline">
                 <input disabled={isReadOnly} type="checkbox" checked={formData.isToric} onChange={e => setFormData({...formData, isToric: e.target.checked})} /> Is Toric (Loạn thị)
               </label>
               <label className="pm-form-group-checkbox">
                 <input disabled={isReadOnly} type="checkbox" checked={formData.isMultifocal} onChange={e => setFormData({...formData, isMultifocal: e.target.checked})} /> Multifocal (Đa tròng)
               </label>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSpecs;

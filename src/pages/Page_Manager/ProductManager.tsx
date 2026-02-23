import React from "react";

interface ProductManagerProps {
  triggerToast: (msg: string) => void;
}

const ProductManager: React.FC<ProductManagerProps> = ({ triggerToast }) => {
  // Logic quản lý sản phẩm ở đây
  const handleAddProduct = () => {
    triggerToast("Sản phẩm đã được thêm thành công!");
  };

  return (
    <div>
      <h4>Quản lý sản phẩm</h4>
      <button onClick={handleAddProduct}>Thêm sản phẩm</button>
      <p>Danh sách sản phẩm sẽ hiển thị ở đây.</p>
    </div>
  );
};

export default ProductManager;
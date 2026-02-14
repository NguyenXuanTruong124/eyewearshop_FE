export interface Product {
  id: number
  brand: string
  name: string
  price: string
  oldPrice?: string
  img: string
  sale?: string
  rating?: number
  desc?: string
}

export const products: Product[] = [
  { id: 1, brand: 'Oakley', name: 'Gọng Kính Titanium Premium', price: '1.800.000đ', oldPrice: '2.400.000đ', img: 'https://images.unsplash.com/photo-1511499767390-91f197606024?w=1000', sale: '-25%', rating: 4.9, desc: 'Gọng titanium nhẹ, bền và thoải mái cho sử dụng hàng ngày.' },
  { id: 2, brand: 'Prada', name: 'Gọng Kính Kim Loại Classic', price: '1.200.000đ', oldPrice: '', img: 'https://images.unsplash.com/photo-1508243529287-e21914733111?w=1000', sale: '', rating: 4.5, desc: 'Thiết kế sang trọng, phù hợp với phong cách công sở.' },
  { id: 3, brand: 'Ray-Ban', name: 'Gọng Kính Nhựa Dẻo TR90', price: '980.000đ', oldPrice: '1.200.000đ', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1000', sale: '-18%', rating: 4.3, desc: 'Vật liệu TR90 đàn hồi, nhẹ, phù hợp cho mọi khuôn mặt.' },
  { id: 4, brand: 'Essilor', name: 'Tròng Kính Chống Ánh Sáng Xanh', price: '650.000đ', oldPrice: '850.000đ', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1000', sale: '-24%', rating: 4.7, desc: 'Bảo vệ mắt trước ánh sáng xanh từ màn hình.' },
  { id: 5, brand: 'Hoya', name: 'Tròng Kính Đổi Màu', price: '1.200.000đ', oldPrice: '', img: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1000', sale: '', rating: 4.8, desc: 'Tự động đổi màu theo điều kiện ánh sáng.' },
  { id: 6, brand: 'Ray-Ban', name: 'Kính Mát Ray-Ban Aviator Cao Cấp', price: '2.800.000đ', oldPrice: '3.500.000đ', img: 'https://images.unsplash.com/photo-1511499767390-91f197606024?w=1000', sale: '-20%', rating: 4.9, desc: 'Kính mát cổ điển, chống tia UV 100%.' },
]

export default products

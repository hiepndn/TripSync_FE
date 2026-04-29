// Dữ liệu tỉnh/thành phố và quận/huyện Việt Nam
// Chỉ bao gồm các địa điểm du lịch phổ biến để giữ bundle nhỏ

export interface District {
  id: string;
  name: string;
}

export interface Province {
  id: string;
  name: string;
  districts: District[];
}

export const VIETNAM_LOCATIONS: Province[] = [
  {
    id: 'hanoi',
    name: 'Hà Nội',
    districts: [
      { id: 'hanoi-hoankiem', name: 'Hoàn Kiếm' },
      { id: 'hanoi-badinh', name: 'Ba Đình' },
      { id: 'hanoi-dongda', name: 'Đống Đa' },
      { id: 'hanoi-tbd', name: 'Hai Bà Trưng' },
      { id: 'hanoi-caugiay', name: 'Cầu Giấy' },
      { id: 'hanoi-tayho', name: 'Tây Hồ' },
      { id: 'hanoi-longbien', name: 'Long Biên' },
      { id: 'hanoi-hadong', name: 'Hà Đông' },
      { id: 'hanoi-socson', name: 'Sóc Sơn' },
      { id: 'hanoi-bavinh', name: 'Ba Vì' },
    ],
  },
  {
    id: 'hcm',
    name: 'TP. Hồ Chí Minh',
    districts: [
      { id: 'hcm-q1', name: 'Quận 1' },
      { id: 'hcm-q3', name: 'Quận 3' },
      { id: 'hcm-q5', name: 'Quận 5' },
      { id: 'hcm-q7', name: 'Quận 7' },
      { id: 'hcm-binhthanh', name: 'Bình Thạnh' },
      { id: 'hcm-phuninh', name: 'Phú Nhuận' },
      { id: 'hcm-tanbinh', name: 'Tân Bình' },
      { id: 'hcm-govap', name: 'Gò Vấp' },
      { id: 'hcm-thu-duc', name: 'TP. Thủ Đức' },
      { id: 'hcm-cangio', name: 'Cần Giờ' },
    ],
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    districts: [
      { id: 'danang-haichau', name: 'Hải Châu' },
      { id: 'danang-thanhkhe', name: 'Thanh Khê' },
      { id: 'danang-sontra', name: 'Sơn Trà' },
      { id: 'danang-nguhanhson', name: 'Ngũ Hành Sơn' },
      { id: 'danang-camle', name: 'Cẩm Lệ' },
      { id: 'danang-lienchinh', name: 'Liên Chiểu' },
      { id: 'danang-hoavang', name: 'Hòa Vang' },
    ],
  },
  {
    id: 'hue',
    name: 'Huế',
    districts: [
      { id: 'hue-thanhpho', name: 'TP. Huế' },
      { id: 'hue-phongdien', name: 'Phong Điền' },
      { id: 'hue-quangdien', name: 'Quảng Điền' },
      { id: 'hue-huongtra', name: 'Hương Trà' },
      { id: 'hue-huongthuy', name: 'Hương Thủy' },
      { id: 'hue-phuvang', name: 'Phú Vang' },
      { id: 'hue-phuoc', name: 'Phú Lộc' },
    ],
  },
  {
    id: 'hoian',
    name: 'Hội An (Quảng Nam)',
    districts: [
      { id: 'hoian-thanhpho', name: 'TP. Hội An' },
      { id: 'hoian-dienbien', name: 'Điện Bàn' },
      { id: 'hoian-daknong', name: 'Duy Xuyên' },
      { id: 'hoian-namgiang', name: 'Nam Giang' },
    ],
  },
  {
    id: 'nhatrang',
    name: 'Nha Trang (Khánh Hòa)',
    districts: [
      { id: 'nhatrang-thanhpho', name: 'TP. Nha Trang' },
      { id: 'nhatrang-camranh', name: 'Cam Ranh' },
      { id: 'nhatrang-ninhoa', name: 'Ninh Hòa' },
      { id: 'nhatrang-vankhanh', name: 'Vạn Ninh' },
      { id: 'nhatrang-dienthanh', name: 'Diên Khánh' },
    ],
  },
  {
    id: 'dalat',
    name: 'Đà Lạt (Lâm Đồng)',
    districts: [
      { id: 'dalat-thanhpho', name: 'TP. Đà Lạt' },
      { id: 'dalat-baolocl', name: 'Bảo Lộc' },
      { id: 'dalat-lacduong', name: 'Lạc Dương' },
      { id: 'dalat-donduong', name: 'Đơn Dương' },
      { id: 'dalat-ductrong', name: 'Đức Trọng' },
    ],
  },
  {
    id: 'phuquoc',
    name: 'Phú Quốc (Kiên Giang)',
    districts: [
      { id: 'phuquoc-thanhpho', name: 'TP. Phú Quốc' },
      { id: 'phuquoc-duongto', name: 'Dương Tơ' },
      { id: 'phuquoc-anhtho', name: 'An Thới' },
      { id: 'phuquoc-hamninh', name: 'Hàm Ninh' },
    ],
  },
  {
    id: 'halong',
    name: 'Hạ Long (Quảng Ninh)',
    districts: [
      { id: 'halong-thanhpho', name: 'TP. Hạ Long' },
      { id: 'halong-campha', name: 'Cẩm Phả' },
      { id: 'halong-uongbi', name: 'Uông Bí' },
      { id: 'halong-vandon', name: 'Vân Đồn' },
      { id: 'halong-cotho', name: 'Cô Tô' },
    ],
  },
  {
    id: 'sapa',
    name: 'Sa Pa (Lào Cai)',
    districts: [
      { id: 'sapa-thanhpho', name: 'TP. Sa Pa' },
      { id: 'sapa-laocai', name: 'TP. Lào Cai' },
      { id: 'sapa-batsxat', name: 'Bát Xát' },
      { id: 'sapa-muongkhuong', name: 'Mường Khương' },
    ],
  },
  {
    id: 'muicne',
    name: 'Mũi Né (Bình Thuận)',
    districts: [
      { id: 'muicne-phanThiet', name: 'TP. Phan Thiết' },
      { id: 'muicne-lagi', name: 'La Gi' },
      { id: 'muicne-tuyPhong', name: 'Tuy Phong' },
      { id: 'muicne-bacBinh', name: 'Bắc Bình' },
    ],
  },
  {
    id: 'cantho',
    name: 'Cần Thơ',
    districts: [
      { id: 'cantho-ninhkieu', name: 'Ninh Kiều' },
      { id: 'cantho-binhthuy', name: 'Bình Thủy' },
      { id: 'cantho-cairang', name: 'Cái Răng' },
      { id: 'cantho-omon', name: 'Ô Môn' },
      { id: 'cantho-thotno', name: 'Thốt Nốt' },
    ],
  },
  {
    id: 'vungtau',
    name: 'Vũng Tàu (Bà Rịa - Vũng Tàu)',
    districts: [
      { id: 'vungtau-thanhpho', name: 'TP. Vũng Tàu' },
      { id: 'vungtau-baria', name: 'TP. Bà Rịa' },
      { id: 'vungtau-conDao', name: 'Côn Đảo' },
      { id: 'vungtau-xuyenMoc', name: 'Xuyên Mộc' },
    ],
  },
  {
    id: 'hatinh',
    name: 'Hà Tĩnh',
    districts: [
      { id: 'hatinh-thanhpho', name: 'TP. Hà Tĩnh' },
      { id: 'hatinh-honglinh', name: 'Hồng Lĩnh' },
      { id: 'hatinh-kyanh', name: 'Kỳ Anh' },
      { id: 'hatinh-huongson', name: 'Hương Sơn' },
    ],
  },
  {
    id: 'quangbinh',
    name: 'Quảng Bình',
    districts: [
      { id: 'quangbinh-dongHoi', name: 'TP. Đồng Hới' },
      { id: 'quangbinh-boquang', name: 'Bố Trạch' },
      { id: 'quangbinh-quangninh', name: 'Quảng Ninh' },
      { id: 'quangbinh-leson', name: 'Lệ Thủy' },
    ],
  },
  {
    id: 'ninh-binh',
    name: 'Ninh Bình',
    districts: [
      { id: 'ninhbinh-thanhpho', name: 'TP. Ninh Bình' },
      { id: 'ninhbinh-tamcoc', name: 'Hoa Lư' },
      { id: 'ninhbinh-nhoQuan', name: 'Nho Quan' },
      { id: 'ninhbinh-kimSon', name: 'Kim Sơn' },
    ],
  },
];

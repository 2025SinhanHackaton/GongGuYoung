// Mock data for development - replace with API calls in production

export interface Product {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  originalPrice: number
}

export interface GroupCampaign {
  id: string
  product: Product
  title: string
  description: string
  targetQuantity: number
  currentQuantity: number
  discountPrice: number
  startDate: string
  endDate: string
  status: "active" | "completed" | "cancelled"
  university: string
  createdBy: string
  participants: number
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "생화학 교재 (Campbell Biology)",
    description: "생명과학과 필수 교재",
    category: "교재/도서",
    imageUrl: "/biology-textbook.png",
    originalPrice: 89000,
  },
  {
    id: "2",
    name: "간호학과 실습복 세트",
    description: "간호학과 실습용 유니폼 (상의+하의)",
    category: "실험복/유니폼",
    imageUrl: "/nursing-uniform.png",
    originalPrice: 45000,
  },
  {
    id: "3",
    name: "iPad Air (64GB)",
    description: "강의 필기용 태블릿",
    category: "전자기기",
    imageUrl: "/ipad-tablet.png",
    originalPrice: 779000,
  },
  {
    id: "4",
    name: "공학용 계산기 (TI-84)",
    description: "수학/공학과 필수 계산기",
    category: "전자기기",
    imageUrl: "/placeholder-gjet4.png",
    originalPrice: 125000,
  },
]

export const mockCampaigns: GroupCampaign[] = [
  {
    id: "1",
    product: mockProducts[0],
    title: "생화학 교재 공동구매 (20명 모집)",
    description: "2024년 2학기 생화학 수업 교재를 함께 구매해요!",
    targetQuantity: 20,
    currentQuantity: 15,
    discountPrice: 75000,
    startDate: "2024-01-15",
    endDate: "2026-01-25",
    status: "active",
    university: "연세대학교",
    createdBy: "김학생",
    participants: 15,
  },
  {
    id: "2",
    product: mockProducts[1],
    title: "간호학과 실습복 단체주문",
    description: "새 학기 실습복을 저렴하게 구매하세요",
    targetQuantity: 30,
    currentQuantity: 22,
    discountPrice: 35000,
    startDate: "2024-01-10",
    endDate: "2024-01-20",
    status: "active",
    university: "연세대학교",
    createdBy: "이간호",
    participants: 22,
  },
  {
    id: "3",
    product: mockProducts[2],
    title: "iPad 공동구매 (학생할인 + 추가할인)",
    description: "강의 필기용 iPad를 더 저렴하게!",
    targetQuantity: 10,
    currentQuantity: 8,
    discountPrice: 699000,
    startDate: "2024-01-12",
    endDate: "2024-01-30",
    status: "active",
    university: "연세대학교",
    createdBy: "박공학",
    participants: 8,
  },
  {
    id: "4",
    product: mockProducts[3],
    title: "공학용 계산기 공구",
    description: "수학과, 공학과 학생들 모여라!",
    targetQuantity: 25,
    currentQuantity: 25,
    discountPrice: 98000,
    startDate: "2024-01-05",
    endDate: "2024-01-15",
    status: "completed",
    university: "연세대학교",
    createdBy: "최수학",
    participants: 25,
  },
]

export const categories = ["전체", "교재/도서", "실험복/유니폼", "전자기기", "문구용품", "생활용품", "식품/간식"]

export const campaigns = mockCampaigns

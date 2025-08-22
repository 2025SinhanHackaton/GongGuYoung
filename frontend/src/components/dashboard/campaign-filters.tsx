import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CampaignFiltersProps {
  onFilterChange: (filters: { search: string; status: string }) => void
}

export function CampaignFilters({ onFilterChange }: CampaignFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleFilterChange = () => {
    onFilterChange({
      search: searchTerm,
      status: selectedStatus,
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="상품명 또는 키워드 검색..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setTimeout(handleFilterChange, 300) // Debounce search
            }}
          />
        </div>

        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value)
            handleFilterChange()
          }}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="active">진행중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

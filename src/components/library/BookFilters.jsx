import React from 'react';
import { Filter } from "lucide-react";
import MobileSelect from "../MobileSelect";

export default function BookFilters({ filters, onFiltersChange }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filter by:</span>
      </div>
      
      <MobileSelect
        value={filters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
        label="Status"
        placeholder="All Status"
        triggerClassName="w-32 rounded-lg"
        options={[
          { value: "all", label: "All Status" },
          { value: "draft", label: "Draft" },
          { value: "completed", label: "Complete" },
          { value: "published", label: "Published" },
        ]}
      />

      <MobileSelect
        value={filters.age_group}
        onValueChange={(value) => handleFilterChange('age_group', value)}
        label="Age Group"
        placeholder="All Ages"
        triggerClassName="w-32 rounded-lg"
        options={[
          { value: "all", label: "All Ages" },
          { value: "3-5", label: "Ages 3-5" },
          { value: "6-8", label: "Ages 6-8" },
          { value: "9-12", label: "Ages 9-12" },
        ]}
      />

      <MobileSelect
        value={filters.focus_topic}
        onValueChange={(value) => handleFilterChange('focus_topic', value)}
        label="Topic"
        placeholder="All Topics"
        triggerClassName="w-40 rounded-lg"
        options={[
          { value: "all", label: "All Topics" },
          { value: "morals", label: "Morals & Values" },
          { value: "finance", label: "Financial Literacy" },
          { value: "mental_health", label: "Mental Health" },
          { value: "career_awareness", label: "Career Awareness" },
          { value: "communication_skills", label: "Communication" },
          { value: "other", label: "Other" },
        ]}
      />
    </div>
  );
}
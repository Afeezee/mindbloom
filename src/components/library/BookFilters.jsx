import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

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
      
      <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
        <SelectTrigger className="w-32 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="completed">Complete</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.age_group} onValueChange={(value) => handleFilterChange('age_group', value)}>
        <SelectTrigger className="w-32 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ages</SelectItem>
          <SelectItem value="3-5">Ages 3-5</SelectItem>
          <SelectItem value="6-8">Ages 6-8</SelectItem>
          <SelectItem value="9-12">Ages 9-12</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.focus_topic} onValueChange={(value) => handleFilterChange('focus_topic', value)}>
        <SelectTrigger className="w-40 rounded-lg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Topics</SelectItem>
          <SelectItem value="morals">Morals & Values</SelectItem>
          <SelectItem value="finance">Financial Literacy</SelectItem>
          <SelectItem value="mental_health">Mental Health</SelectItem>
          <SelectItem value="career_awareness">Career Awareness</SelectItem>
          <SelectItem value="communication_skills">Communication</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
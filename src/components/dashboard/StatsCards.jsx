import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCards({ title, value, icon: Icon, bgColor, description }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
        <div className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 bg-gradient-to-br ${bgColor} rounded-full opacity-10`} />
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
              <div className="text-3xl font-bold text-gray-900">{value}</div>
            </div>
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${bgColor} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {description && (
            <p className="text-sm text-gray-600 font-medium">{description}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
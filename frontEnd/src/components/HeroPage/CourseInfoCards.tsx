import React from 'react';
import { User, Clock, BookOpen, Shield } from 'lucide-react';
import type { Course } from '../../types/Course.types';

export const CourseInfoCards: React.FC<{ course: Course }> = ({ course }) => {
  const items = [
    { icon: User, label: 'Audience', value: course.audience },
    { icon: Clock, label: 'Duration', value: `${course.duration?.value} ${course.duration?.unit}` },
    { icon: BookOpen, label: 'Modules', value: `${course.module} Modules` },
    { icon: Shield, label: 'Standards', value: course.standards },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-lg hover:bg-white/20 hover:-translate-y-1 transition">
          <item.icon className="w-5 h-5 opacity-80" />
          <div>
            <p className="text-xs uppercase text-white/70">{item.label}</p>
            <p className="font-medium">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Users, Clock, BookOpen, Shield } from 'lucide-react';
import type { Course } from '../../types/Course.types';
import { formatAudience } from '../../utils/courseHelpers';

const unitLabel = (unit?: string) => {
    const raw = String(unit || 'Hours').trim();
    if (!raw) return 'Hours';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
};

const moduleHint = (course: Course) => {
    const count = Number(course.module) || 0;
    const value = Number(course.duration?.value) || 0;
    const unit = String(course.duration?.unit || '').toLowerCase();
    if (!count || !value) return 'Short focused lessons';
    const hours = unit.startsWith('min') ? value / 60 : value;
    const each = Math.round((hours * 60) / count);
    if (!each) return 'Short focused lessons';
    const low = Math.max(5, each - 5);
    const high = each + 5;
    return `${low}–${high} minutes each`;
};

export const CourseInfoCards: React.FC<{ course: Course }> = ({ course }) => {
    const level = String(course.level || '').trim();
    const standards = String(course.standards || '').trim();
    const delivery = String((course as any)?.courseForge?.deliveryMode || '').trim() || 'Self-paced learning';
    const standardsHint = /regional/i.test(standards)
        ? (course.country || 'Regional standards')
        : /industry/i.test(standards)
            ? 'Industry standards'
            : 'International standards';
    const items = [
        { icon: Users, label: 'Audience', value: formatAudience(course.audience as any) || 'Learners', hint: /^beginner$/i.test(level) ? 'Ideal for beginners' : level ? `For ${level.toLowerCase()} learners` : 'Who this course is for' },
        { icon: Clock, label: 'Duration', value: course.duration?.value ? `${course.duration.value} ${unitLabel(course.duration.unit)}` : 'Flexible', hint: delivery },
        { icon: BookOpen, label: 'Modules', value: `${course.module || 0} Modules`, hint: moduleHint(course) },
        { icon: Shield, label: 'Standards', value: standards || 'Not set', hint: standardsHint },
    ];
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0c121c] px-4 py-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-lime-400 shadow-[0_0_18px_rgba(132,204,22,0.22)]">
                        <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                        <p className="truncate text-base font-bold text-white">{item.value}</p>
                        <p className="truncate text-xs text-white/45">{item.hint}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

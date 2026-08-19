import React, { useState } from 'react';
import { Globe, UsersRound, Book, ClipboardCheck } from 'lucide-react';
import { FaShieldAlt, FaLightbulb, FaGraduationCap, FaCaretDown, FaIndustry } from 'react-icons/fa';
import { useCourseData } from '../contextAPI/courseAPI';


const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "India", "Australia", "Germany", "France", "China", "Japan", "Brazil", "Other"
];

const COURSE_TYPE = [
  { id: "certification", label: "Certification" },
  { id: "awareness", label: "Awareness" },
  { id: "advanced", label: "Advanced" }
];

const LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

// Map each course type to an icon
const COURSE_TYPE_ICONS: Record<string, React.ReactNode> = {
  certification: <FaShieldAlt />,
  awareness: <FaLightbulb />,
  advanced: <FaGraduationCap />
};

const INDUSTRIES = [
  "Healthcare & Medical",
  "Finance & Banking",
  "Information Security / Cybersecurity",
  "Manufacturing & Industrial",
  "Education & Academic",
  "Pharmaceutical & Life Sciences",
  "Hospitality & Tourism",
  "Environmental & Sustainability",
  "Other"
];

const CourseBasicInfo: React.FC = () => {
  const { courseData, updateCourseData } = useCourseData();
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  // Update parent state if needed
  const handleStandardsTypeChange = (type: 'Global' | 'Regional') => {
    updateCourseData({ standards: type });
    if (type === 'Global') {
      updateCourseData({ country: '' });
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateCourseData({ country: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <div className="flex justify-between">
          <label htmlFor="title" className="block text-sm font-medium text-gray-400
           mb-1">
            <div className='flex items-center'>
              <Book className='w-5 h-5 text-lime-500 mr-2' />
              Course Title <span className="text-red-500">*</span>
            </div>
          </label>
          <span className="text-xs text-gray-500">{courseData.title.length}/100</span>
        </div>
        <input
          type="text"
          id="title"
          value={courseData.title}
          onChange={(e) => updateCourseData({ title: e.target.value })}
          maxLength={100}
          placeholder="e.g., Mastering Web Development with React"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors"
          required
        />
      </div>
      {/* COURSE-TYPE */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">
          <div className='flex items-center'>
            <FaCaretDown className='w-5 h-5 text-lime-500 mr-2' />
            Course Type <span className="text-red-500">*</span>
          </div>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COURSE_TYPE.map((type) => (
            <div
              key={type.id}
              onClick={() => updateCourseData({ type: type.id })}
              className={`
                cursor-pointer border rounded-lg p-4 text-center transition-all duration-200
                ${courseData.type === type.id
                  ? 'border-lime-500 bg-lime-50 text-lime-600 shadow-sm'
                  : 'border-gray-300 bg-gray-50 hover:border-lime-500 hover:bg-lime-50/50'
                }
              `}
            >
              <div className="flex flex-col items-center">
                <span className={`w-10 h-10 mb-1 ${courseData.type === type.id ? 'text-lime-600' : 'text-gray-600'}`}>
                  {React.cloneElement(COURSE_TYPE_ICONS[type.id] as React.ReactElement, { size: 30 })}
                </span>
                <span className="text-sm font-medium">{type.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* AUDIENCE  */}
      <div className='w-full'>
        <label htmlFor='courseRegion' className="block text-sm font-medium text-gray-400 mb-1">
          <div className='flex items-center'>
            <UsersRound className='w-5 h-5 text-lime-500 mr-2' />
            Audience <span className='text-red-500'>*</span>
          </div>
        </label>
        <input
          type='text'
          id='audience'
          value={courseData.audience}
          onChange={(e) => updateCourseData({ audience: e.target.value })}
          placeholder="e.g: HVAC technicians, students, senior managers "
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
          required
        ></input>
      </div>

      {/* INDUSTRY SPECIFIC */}
      <div className='w-full'>
        <label htmlFor='industry' className="block text-sm font-medium text-gray-400 mb-1">
          <div className='flex items-center'>
            <FaIndustry className='w-5 h-5 text-lime-500 mr-2' />
            Industry Specific <span className='text-red-500'>*</span>
          </div>
        </label>
        <select
          id='industry'
          value={showCustomIndustry ? 'Other' : (courseData.industry || '')}
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'Other') {
              setShowCustomIndustry(true);
              updateCourseData({ industry: '' });
            } else {
              setShowCustomIndustry(false);
              updateCourseData({ industry: val });
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500 transition-colors"
          required
        >
          <option value="" disabled>Select an Industry</option>
          {INDUSTRIES.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        {showCustomIndustry && (
          <input
            type="text"
            value={courseData.industry}
            onChange={(e) => updateCourseData({ industry: e.target.value })}
            placeholder="Enter custom industry"
            className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition-colors"
            required
          />
        )}
      </div>

      <div className='w-full'>
        {/* Standards */}
        <div className="flex items-center  mb-2">
          <label className="flex items-center text-sm font-medium text-gray-400 mb-1">
            <div className='flex items-center'>
              <ClipboardCheck className="w-5 h-5 text-lime-500 mr-2" />
              Standards <span className='text-red-500'>*</span>
            </div>
          </label>
          {/* Global / Regional */}
          <div className="flex space-x-4 ml-4">
            <label className="flex items-center cursor-pointer text-gray-400">
              <input
                type="radio"
                name="standardsType"
                value="Global"
                checked={courseData.standards === 'Global'}
                onChange={() => handleStandardsTypeChange('Global')}
                className="mr-2 accent-lime-500"
              />
              Global
            </label>
            <label className="flex items-center cursor-pointer text-gray-400">
              <input
                type="radio"
                name="standardsType"
                value="Regional"
                checked={courseData.standards === 'Regional'}
                onChange={() => handleStandardsTypeChange('Regional')}
                className="mr-2 accent-lime-500"
              />
              Regional
            </label>
          </div>
        </div>

        {courseData.standards === 'Regional' && (
          <div className="w-full mb-2 mt-8">
            <label htmlFor="country" className="block text-sm font-medium text-gray-400 mb-1">
              <div className='flex items-center'>
                <Globe className='w-5 h-5 text-lime-500 mr-2' />
                Select Country <span className="text-red-500">*</span>
              </div>
            </label>
            <select
              id="country"
              value={courseData.country}
              onChange={handleCountryChange}
              className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500  transition-colors"
              required
            >
              <option value=""> Select a Country </option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseBasicInfo;

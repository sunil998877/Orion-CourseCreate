import React from 'react';
import Logo from './Logo'

const FormHeader: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center rounded-full animate-slideDown">
        <Logo />
      </div>
      <div className="-translate-y-8">
        <h1 className="text-3xl font-bold text-white">Create a New Course</h1>
        <p className="text-sm text-white/70 max-w-2xl mx-auto">
          Share your expertise with the world. Fill in the details below to create your course.
        </p>
      </div>
    </div>
  );
};

export default FormHeader;

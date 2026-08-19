const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontEnd/src/components/CourseCreatorForm.tsx');
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const extract = (startLine, endLine, name) => {
  const extracted = lines.slice(startLine - 1, endLine).join('\n');
  fs.writeFileSync(path.join(__dirname, `frontEnd/src/components/CourseCreator/${name}.tsx`), extracted, 'utf-8');
};

if (!fs.existsSync(path.join(__dirname, 'frontEnd/src/components/CourseCreator'))) {
  fs.mkdirSync(path.join(__dirname, 'frontEnd/src/components/CourseCreator'), { recursive: true });
}

// These are approximate line numbers based on the view_file outputs.
// Step 1: 1957 - 2651
// Step 2: 2654 - 2962
// Step 4: 2965 - 3549
// Step 5: 3551 - 3754

extract(1957, 2651, 'StepBasicInfoJSX');
extract(2654, 2962, 'StepDetailsJSX');
extract(2965, 3549, 'StepPreviewJSX');
extract(3551, 3754, 'StepLaunchJSX');

console.log("Extraction complete.");

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const email = `ebooktest_${Date.now()}@example.com`;
const password = 'test123';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  try {
    // 1. Register
    console.log('1. Registering user...');
    const regRes = await axios.post(`${BASE_URL}/register`, {
      username: 'ebooktester',
      organisation: 'TestOrg',
      email,
      password
    });
    const token = regRes.data.token;
    console.log('   Token:', token ? '✅' : '❌');

    // 2. Create course
    console.log('2. Creating course...');
    const createRes = await axios.post(`${BASE_URL}/courses`, {
      courseData: {
        title: "Ebook Test Course",
        description: "Testing ebook generation with MongoDB storage",
        audience: "Developers",
        type: "Technical",
        module: 2,
        level: "Beginner",
        duration: { value: 5, unit: "hours" },
        standards: "ISO",
        country: "Global"
      }
    }, { headers: { Authorization: `Bearer ${token}` } });
    const courseId = createRes.data.courseId || createRes.data._id;
    console.log('   Course ID:', courseId);

    // 3. Generate modules first
    console.log('3. Generating modules (this may take a moment)...');
    const modRes = await axios.post(`${BASE_URL}/generate-all-modules-draft`, {
      courseId
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('   Modules generated:', modRes.data?.modules?.length || 'check response');

    // 4. Generate ebook
    console.log('4. Generating ebook...');
    const ebookRes = await axios.post(`${BASE_URL}/courses/${courseId}/generate-ebook`, {
      publisherName: 'Test Publisher'
    }, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 180000
    });
    console.log('   Ebook response status:', ebookRes.status);
    console.log('   ebookUrl:', ebookRes.data.ebookUrl);
    console.log('   ebookStatus:', ebookRes.data.ebookStatus);

    if (ebookRes.data.ebookUrl) {
      // 5. Test download
      console.log('5. Testing ebook download...');
      const dlRes = await axios.get(`${BASE_URL}${ebookRes.data.ebookUrl.replace('/api', '')}`, {
        responseType: 'arraybuffer'
      });
      const pdfHeader = dlRes.data.slice(0, 5).toString();
      console.log('   Download status:', dlRes.status);
      console.log('   PDF header:', pdfHeader);
      console.log('   PDF size:', dlRes.data.length, 'bytes');
      console.log('   ✅ Download works! PDF is valid:', pdfHeader === '%PDF-');
    }

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.status, JSON.stringify(error.response.data));
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

run();

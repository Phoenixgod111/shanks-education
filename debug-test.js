// Debug test for Shanks Education
console.log('=== DEBUG TEST START ===');

// Test 1: Check subjects-config.json
fetch('subjects/subjects-config.json')
  .then(r => r.json())
  .then(config => {
    console.log('✅ subjects-config.json loaded:', config);
    console.log('📚 Subjects count:', config.subjects.length);

    const math = config.subjects.find(s => s.id === 'math');
    console.log('📚 Math subject:', math);
    console.log('📚 Math classes:', math.classes);
    console.log('📚 Math has class 8:', math.classes.includes(8));
  })
  .catch(e => console.error('❌ subjects-config.json error:', e));

// Test 2: Check topics-8.json
fetch('subjects/math/topics-8.json')
  .then(r => r.json())
  .then(topics => {
    console.log('✅ topics-8.json loaded:', topics);
    console.log('📋 Topics count:', topics.topics.length);
    console.log('📋 First topic:', topics.topics[0]);
  })
  .catch(e => console.error('❌ topics-8.json error:', e));

// Test 3: Check subject-manager
setTimeout(() => {
  if (window.subjectManager) {
    console.log('✅ subjectManager exists');
    console.log('🔍 subjectsConfig loaded:', !!window.subjectManager.subjectsConfig);
    console.log('🔍 subjectsConfig:', window.subjectManager.subjectsConfig);

    if (window.subjectManager.subjectsConfig) {
      const math = window.subjectManager.subjectsConfig.find(s => s.id === 'math');
      console.log('🔍 Math from subjectManager:', math);
      console.log('🔍 Math classes from subjectManager:', math?.classes);
    }

    const subjectInfo = window.subjectManager.getSubjectInfo('math');
    console.log('🔍 getSubjectInfo result:', subjectInfo);
  } else {
    console.error('❌ subjectManager not found');
  }
}, 1000);

console.log('=== DEBUG TEST END ===');
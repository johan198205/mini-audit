import { parseScreamingFrog } from '../screamingFrog';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Simple test to verify parser works
async function testScreamingFrogParser() {
  const testData = `Address,Title 1,Meta Description 1,H1-1,Canonical Link Element 1,Schema.org Type,Status Code,Images Missing Alt Text
https://example.com,Example Homepage,This is an example homepage for testing,Welcome to Example,https://example.com/,WebSite,200,2
https://example.com/about,About Us - Example,Learn more about our company and mission,About Our Company,https://example.com/about,AboutPage,200,1`;

  // Create test file
  const testDir = join(process.cwd(), 'tmp', 'test');
  await mkdir(testDir, { recursive: true });
  const testFile = join(testDir, 'test-screaming-frog.csv');
  await writeFile(testFile, testData);

  try {
    const result = await parseScreamingFrog(testFile);
    console.log('✅ Screaming Frog parser test passed');
    console.log('Parsed rows:', result.length);
    console.log('Sample row:', result[0]);
    return true;
  } catch (error) {
    console.error('❌ Screaming Frog parser test failed:', error);
    return false;
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testScreamingFrogParser().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testScreamingFrogParser };



import { writeFileSync } from 'fs';

// File path
const filePath = './output.csv';

// CSV header
const headers = ['id', 'field1', 'field2', 'field3', 'field4'];
writeFileSync(filePath, headers.join(',') + '\n'); // write header

// Function to generate a unique id (simple version)
function generateId(index: number) {
  return `id-${index}`;
}

// Generate 100,000 rows
for (let i = 1; i <= 100_000; i++) {
  const row = [
    generateId(i),
    `field1_value_${i}`,
    `field2_value_${i}`,
    `field3_value_${i}`,
    `field4_value_${i}`,
  ];
  writeFileSync(filePath, row.join(',') + '\n', { flag: 'a' }); // append row
}

console.log('CSV file generated!');

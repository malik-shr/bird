import { writeFileSync } from 'fs';

// File path
const filePath = 'bird_data/output.csv';

// CSV header
const headers = ['field1', 'field2', 'field3', 'field4'];
writeFileSync(filePath, headers.join(',') + '\n'); // write header

// Generate 100,000 rows
for (let i = 1; i <= 100; i++) {
  const row = [
    `field1_value_${i}`,
    `field2_value_${i}`,
    `field3_value_${i}`,
    `field4_value_${i}`,
  ];
  writeFileSync(filePath, row.join(',') + '\n', { flag: 'a' }); // append row
}

console.log('CSV file generated!');

import { Kysely } from 'kysely';

export async function exportCollection(
  collection_name: string,
  db: Kysely<DB>
) {
  const records = await db.selectFrom(collection_name).selectAll().execute();
  const output = arrayToCSV(records);

  // Ensure directory exists
  const dirPath = `bird_data/tmp/${collection_name}`;
  await Bun.write(`${dirPath}/.keep`, ''); // Creates directory if it doesn't exist

  const filePath = `${dirPath}/${collection_name}.csv`;
  await Bun.write(filePath, output);

  const file = Bun.file(filePath);

  return new Response(file, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${collection_name}.csv"`,
      'Content-Length': file.size.toString(),
    },
  });
}

function arrayToCSV(data: Record<string, any>) {
  if (!data.length) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);

  // Create header row
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map((obj: any) =>
    headers
      .map((header) => {
        const value = obj[header];
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"') || value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
}

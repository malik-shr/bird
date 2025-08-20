import { file } from 'bun';
import { sse, Static, t } from 'elysia';
import { Kysely } from 'kysely';

export const importRecordsBody = t.Object({ file: t.File() });

export async function* importRecords(
  collection_name: string,
  body: Static<typeof importRecordsBody>,

  db: Kysely<DB>
) {
  try {
    const startTime = performance.now();

    const id = crypto.randomUUID();
    const filePath = `bird_data/tmp/import/${collection_name}/${id}`;

    await Bun.write(filePath, body.file);

    yield sse({
      data: { message: 'File imported succesfully', completed: false },
    });

    const collection = await db
      .selectFrom('collections_meta')
      .selectAll()
      .where('name', '=', collection_name)
      .executeTakeFirstOrThrow();

    const fields = await db
      .selectFrom('fields_meta')
      .selectAll()
      .where('collection', '=', collection.id)
      .execute();

    const file = Bun.file(filePath);

    const content = await file.text();

    const lines = content.trim().split('\n');

    const headers = lines[0].split(',');

    for (let i = 0; i < headers.length; i++) {
      headers[i] = headers[i].trim();
    }

    const fieldNames = fields.map((item) => item.name);

    for (let i = 0; i < fieldNames.length; i++) {
      if (fieldNames[i] !== headers[i]) {
        throw Error('Unvalid Field signature');
      }
    }

    const data = new Array(lines.length - 2);

    for (let i = 0; i < headers.length; i++) {
      headers[i] = headers[i].trim();
    }

    for (let i = 1; i < lines.length; i++) {
      const entries = lines[i].split(',');
      const row: Record<string, string> = {};

      for (let j = 0; j < entries.length; j++) {
        const entry = entries[j].trim();
        row[headers[j]] = entry;
      }

      data[i - 1] = row;
    }

    const batchSize = 500;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      await db.insertInto(collection_name).values(batch).execute();

      yield sse({
        data: {
          message: `${(i + batchSize / data.length) * 100}%`,
          completed: false,
        },
      });
    }

    const endTime = performance.now();
    const totalTime = Math.round(endTime - startTime);

    console.log(`Imported ${data.length} Records in ${totalTime} ms`);

    yield sse({
      data: { message: 'Imported Records successfully', completed: true },
    });

    return { message: 'Imported Records successfully' };
  } catch (e) {
    console.error(e);
  }
}

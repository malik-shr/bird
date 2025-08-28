export async function download(
  collection_name: string,
  record_id: string,
  file_name: string
) {
  try {
    const path = `bird_data/storage/${collection_name}/${record_id}/${file_name}`;

    const file = Bun.file(path);

    return new Response(file);
  } catch (e) {
    console.error(e);
  }
}

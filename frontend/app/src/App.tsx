export default function TableControls() {
  const createTable = async () => {
    const res = await fetch(`/api/collections/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_name: 'my_table',
        columns: [
          { name: 'id', type: 'Integer', primary_key: true },
          { name: 'name', type: 'String' },
        ],
      }),
    });

    const data = await res.json();
    console.log('Created Table:', data);
  };

  const addRecord = async () => {
    const res = await fetch(`/api/collections/my_table/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        values: {
          id: 1,
          name: 'Example',
        },
      }),
    });

    const data = await res.json();
    console.log('Added Record:', data);
  };

  const deleteRecord = async () => {
    await fetch(`api/collections/my_table/records/1`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_name: 'my_table',
        filters: { id: 1 },
      }),
    });

    console.log('Deleted Record');
  };

  const deleteTable = async () => {
    await fetch(`/api/collections/my_table`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    console.log('Deleted Table');
  };

  const selectTable = async () => {
    const res = await fetch('/api/collections/my_table/records', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    console.log('Selected Rows:', data.records);
  };

  return (
    <>
      <button onClick={createTable}>Create Table</button>
      <button onClick={selectTable}>Select</button>
      <button onClick={addRecord}>Add Record</button>
      <button onClick={deleteRecord}>Delete Record</button>
      <button onClick={deleteTable}>Delete Table</button>
    </>
  );
}

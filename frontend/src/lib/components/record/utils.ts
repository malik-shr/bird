import type Bird from '$lib/sdk';

export function assignRecordFormData(fields: Bird.Field[]) {
  return fields.reduce((a, field) => {
    if (field.name === 'id') {
      return Object.assign(a, { [field.name]: 'Autogeneration' });
    }

    if (
      field.type === 'String' ||
      field.type === 'File' ||
      field.type === 'Markdown'
    ) {
      return Object.assign(a, { [field.name]: '' });
    } else if (field.type === 'Boolean') {
      return Object.assign(a, { [field.name]: false });
    } else if (field.type === 'Select') {
      return Object.assign(a, { [field.name]: 'Select Option' });
    } else if (field.type === 'Relation') {
      return Object.assign(a, { [field.name]: 'Select Relation' });
    }

    return Object.assign(a, { [field.name]: 0 });
  }, {});
}

export function getInputType(column: Bird.Field) {
  if (column.name === 'password') return 'password';
  if (column.type === 'Integer' || column.type === 'Float') {
    return 'number';
  } else if (column.type === 'Date') {
    return 'date';
  } else if (column.type === 'File') {
    return 'file';
  }

  return 'text';
}

export function getOptionText(field: Bird.Field, option_value: number) {
  const option = field.options?.filter(
    (option) => option.value === option_value
  )[0];

  if (option) {
    return option.text;
  }

  return 'Select Option';
}

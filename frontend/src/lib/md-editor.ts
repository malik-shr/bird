import EasyMDE from 'easymde';
import DOMPurify from 'isomorphic-dompurify';

export function newEditor(initialValue: string) {
  return new EasyMDE({
    element: document.getElementById('markdown-editor')!,
    renderingConfig: {
      sanitizerFunction: (renderedHTML) => {
        // Using DOMPurify and only allowing <b> tags
        return DOMPurify.sanitize(renderedHTML, { ALLOWED_TAGS: ['b'] });
      },
    },
    initialValue: initialValue,
    toolbar: [
      'bold',
      'italic',
      'heading',
      '|',
      'quote',
      'code',
      '|',
      'table',
      'preview',
      {
        name: 'others',
        className: 'fa fa-blind',
        title: 'others buttons',
        children: [
          {
            name: 'image',
            action: EasyMDE.drawImage,
            className: 'fa fa-picture-o',
            title: 'Image',
          },
          {
            name: 'quote',
            action: EasyMDE.toggleBlockquote,
            className: 'fa fa-percent',
            title: 'Quote',
          },
          {
            name: 'link',
            action: EasyMDE.drawLink,
            className: 'fa fa-link',
            title: 'Link',
          },
        ],
      },
    ],
    minHeight: '600px',
    maxHeight: '600px',
  });
}

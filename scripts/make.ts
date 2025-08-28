await Bun.build({
  entrypoints: ['./index.ts'],
  outdir: './dist',
  compile: {
    outfile: 'bird.exe',
  },
});

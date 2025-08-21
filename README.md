# bird

## About

Bird is a Backend written in Bun Elysia. It is heavily inspired by [Pocketbase](https://github.com/pocketbase/pocketbase). It includes a

- Easy to use Admin Ui
- File Upload/ Download functionality
- Realtime subscription to the database
- Plugin System, where community driven Plugins can be added
- User Authentification

> [!WARNING]
> Bird is still under heavy developement, so it isn't production ready.

## Usage

Run from root directory

```bash
bun dev
```

## Benchmarks

### Import Records

- **1_000_000** Records **96403 ms** (**10.37** ms/Record)
- **500_000** Records **45843 ms** (**10,9** ms/Record)
- **100_000** Records **9150 ms** (**10.93** ms/Record)
- **10_000** Records **1053 ms** (**9.5** ms/Record)
- **1000** Records **200 ms** (**5** ms/Record)
- **100** Records **45 ms** (**2.22** ms/Record)

### Roadmap

- [ ] Performance Improvements
- [ ] Make download/ upload streamable
- [ ] Ensure safe authentification
- [ ] Improve file storage
- [ ] Replace SQLite with PostgreSQL

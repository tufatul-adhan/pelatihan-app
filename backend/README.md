# Backend PostgreSQL

The backend uses PostgreSQL database `db_pelatihan`. Configure `.env` with
your local PostgreSQL credentials (`DB_HOST`, `DB_PORT`, `DB_USER`, and
`DB_PASSWORD`), then run from this folder:

```powershell
npm install
npm run db:setup
npm run dev
```

`npm run db:setup` creates the database if needed and creates the `users`,
`pelatihan`, and `permintaan` tables. Optional sample training records can be
added with `npm run db:seed`. Create an admin by setting `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in the environment before running `npm run db:create-admin`.

# tcn-v4

## database migrations

migrations are currently broken due to desynchronization between what drizzle thinks the database state is and what it actually is. I'm not sure how to fix this. for now, just run `pnpm run migrate`, let it fail, and then find the latest `.sql` file in `drizzle/` and run the queries manually

## project structure

[`backend/`](/src/backend/) contains the code for both bots (main and global chat)
- [`backend/actions/`](/src/backend/actions/) has the [tRPC](https://trpc.io/) queries &mdash; anything that requires the dashboard to fetch data from discord or execute an action within discord needs to be put here as a query or a mutation. as a basic example, see [`backend/actions/add-character.ts`](/src/backend/actions/add-character.ts) which is referenced on the frontend using an [`actions.ts`](/src/web/app/(admin)/admin/characters/actions.ts) file
- [`backend/db/schemas.ts`](/src/backend/db/schemas.ts) has the schemas for the database tables. the other two files probably won't need to be changed
- the rest of [`backend/`](src/backend/) is fairly self-explanatory

[`web/`](/src/web/) has all of the frontend website code which should be a fairly self-explanatory next.js project

## deployment

the project is deployed at [`https://teyvatcollective.network`](https://teyvatcollective.network) &mdash; you can SSH using `username@teyvatcollective.network`. processes are running on the root user. use `mysql` to manually inspect the database

processes run on `screen`s &mdash; the basic commands to know are `screen -r name` to reconnect to a screen, `ctrl-a d` to disconnect from a screen (using `ctrl-c` will interrupt the process), and `screen -S name` to start a new screen (e.g. in case of a VPS restart)

the backend does not need to be compiled; just run `pnpm backend` in a screen

the frontend should be compiled with `pnpm web:build` and then run with `PORT=3001 pnpm web`

don't ask me how to run it in a dev environment; I don't have any idea anymore. you'll probably need to set up test servers and copy `.env` from prod and replace all of the values with the test IDs
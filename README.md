## FarmLend

#### HOW TO RUN

#### Docker Images
To run the application, you'll need to make sure you have Docker and Docker compose installed

You can start the application by running the following command:

```bash
make start
```

This will build the docker image and start the container in detached mode.

To stop the container, run the following command:

```bash
make stop
```

#### Building from Source
To build from the source code, you need:

* NodeJS [version 16 or greater](https://nodejs.org).
* Npm [version 6 or greater](https://npmjs.com).
* Postgres

```bash
git clone https://github.com/thtta/farmlend.git && cd farmlend
npm install
```

You'll need to add your database credentials to an `.env` file. Generate an `.env` file by running:

```bash
cp .env.example .env
```

```
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=

PORT=3000
```

You can then run migrations with the following command:

```bash
npm run migrate
```
Start the application with:

```bash
npm run start:dev
```

### Testing
To run integration tests, you'll need to add a `.testing.env` config file. You can generate a `.testing.env` file by running:

```bash
cp .testing.env.example .testing.env
```
You can now edit the config file with your test database credentials and run integration tests by running the following command:

```bash
npm run test:e2e
```

To run unit tests, you can run the following command:

```bash
npm run test
```

### Docs
The API docs for the endpoints can be found [here](https://documenter.getpostman.com/view/2432385/2s93kz75pb). There's also a postman collection in the [docs](https://github.com/thtta/farmlend/tree/main/docs) directory.

### Deployment
The API is currently deployed on a VM hosted by [Fly.io](https://fly.io/). Live url - https://farmlend.fly.dev/

To deploy the API, you'll need to have an account on Fly.io and have their cli tool `flyctl` installed locally. From the root of the project's directory, you can now run 
the following commands:

- `flyctl launch`.  This will ask you if you would like to copy the existing `fly.toml` configuration to the new app. Select `yes`. 
- Next, you will be prompted with a couple of follow up questions, you can pick default values. Once you're done, this will create and configure
a `fly` app for you by inspecting the source code, then prompt you to deploy, select `yes` as well. 
- After deployment, you'll need to have a Postgres instance deployed. You can now set environment variables for the app on `fly.io`. You can do so by running the following command:

```bash
flyctl secrets set DB_HOST= DB_PORT= DB_USERNAME= DB_PASSWORD= DB_NAME= PORT=8080
```
- To view the deployed app, you can run `flyctl status`
- To deploy changes to the app, run `flyctl deploy`
- To browse the deployed application, run `flyctl open`

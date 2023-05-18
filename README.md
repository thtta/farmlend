## FarmLend

#### HOW TO RUN
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
The API is currently deployed on a VM hosted by Fly.io. Live url - https://farmlend.fly.dev/
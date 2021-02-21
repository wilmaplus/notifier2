
## Supported environment variables
- `DEBUG`           Enables debugging and additional logs
- `DEV`             Changes worker file path for development environment
- `PORT`            HTTP Server port
- `PROXY`           When this environment is set, it sets rate-limit configuration to include setting, which tells that this HTTP Server is behind a proxy.
- `FCM_KEY`         Path to firebase credentials `.json` file
- `IID_PKGNAME`     When defined, and not empty, IID checker will check for valid app package name you defined in this environment variable.
- `IID_URL`         (optional) overrides IID server URL
- `DBCONFIG`        File path to `dbconfig.json`
- `LONG_FILENAMES`  If your system supports long filenames, it's recommended to enable that by setting this variable's value to `true`

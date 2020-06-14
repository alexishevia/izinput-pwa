# IZ Input PWA

IZ Input PWA is a Progressive Web App that lets you manually add transactions to "Invoice Zero" - the personal finance system.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting Started

1. Install NodeJS (v12.16.0+ preferred)
2. Run `npm install`
3. Create a `.env.local` file at the root of the project, with the following values:

   ```
   REACT_APP_GOOGLE_API_KEY=yourAPIKey
   REACT_APP_GOOGLE_CLIENT_ID=yourClientID
   ```

   Notes:

   - You can find the `GOOGLE_API_KEY` and `GOOGLE_CLIENT_ID` in the [Google Developer Console](https://console.developers.google.com).  
     If you do not already have an app in the Google Developer Console, read the [Create a Google App](#create-a-google-app) section.
   - In prod, these variables are set up as part of the Netlify deployment environment.

## Create a Google App

- Create your App in the [Google Developer Console](https://console.developers.google.com).
- In the "Credentials" tab: `Create Credentials > OAuth client ID`, and select `Web application`
- In the "Library" tab:
  - look for "Google Drive API" and click `Enable`
  - look for "Google Sheets API" and click `Enable`
- In the "Credentials" tab again: `Create Credentials > API key`
  Once the API key is created, you can edit it and `Restrict` it in two ways:
  1. `HTTP referrers (web sites)`
     So only your website can use that apikey.
  2. `API restrictions`
     Select both the "Google Drive API" and "Google Sheets API"

## GDrive Sync

This app allows syncing data to a Google Drive Spreadsheet. [Read More](./docs/gdrive_sync.md)

## UI Library

This project was built using [Semantic UI React](https://react.semantic-ui.com). No particular reason, other than it looked nice and easy to use.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

Note: you'll need a `.env.test.local` file at the root of the project, with the following values:

```
REACT_APP_GOOGLE_API_KEY=foo
REACT_APP_GOOGLE_CLIENT_ID=bar
```

As long as the values are set, you should be fine. No need to use real values for test environment.

### `npm build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

# pnwfc-map

The wool map. This project uses Mapbox via `mapbox-gl-js` to show data stored in a private AirTable. We use Vercel for hosting, using their serverless functions for the API in Node.js, and a Vue.js app for the website. 

### Development
Most of the development is done in the Vue.js app, which is in the `www` folder. It can be run locally via this command in the terminal, from the base directory of this project:
```
npm i
npm run dev
```
`index.html` is the main webpage of the app. We use `vite` to bundle the JavaScript into an index.js file, which is referenced in the index.html.

`package.json` is the manifest for project dependencies and scripts to debug, test, or build the project.
 
 `vite.config.js` configures our build tool, which determines how the JavaScript is bundled.
 
### Deployment
This project will be published to https://pnwfc-api-vercel.vercel.app/ when a pull request is merged, or a push is made to the `main` branch. This act is configured in our private Vercel account.

The project can be integrated into a client's website by adding an `<iframe>` to any page of their choice. For example:
``` html
 <iframe 
    src="https://pnwfc-api-vercel.vercel.app/" 
    width="100%" 
    height="600" 
  ></iframe>
```
The CORS configuration that allows this resource sharing is in /api/locations.js.

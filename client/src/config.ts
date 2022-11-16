// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'd5jf1vcp2g'
// https://3doqpi3af4.execute-api.us-east-1.amazonaws.com/dev
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  domain: 'anhntc2001-udacity.us.auth0.com',
  clientId: '7gQBLgKrJj40ihEOIeYUnog9vm53XIwl',
  callbackUrl: 'http://localhost:3000/callback'
}

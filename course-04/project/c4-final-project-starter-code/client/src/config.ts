// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'imwj1cgftf'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-r7gvvr6e.eu.auth0.com',            // Auth0 domain
  clientId: 'YjCyWF4aTFdRgiH8tBabq02ebt1vy83t',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-r7gvvr6e.eu.auth0.com/.well-known/jwks.json'
const kid = 'eVPkAQsBXz88iLBXyhge4'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info("Verifying authentication header", { authHeader })
  // Parse token
  const token = getToken(authHeader)
  logger.info("Received Token", { token })

  // Retrieve current Certificate
  const certificate: string = await getCertificate()
  logger.info("Retrieved certificate", { certificate })

  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(): Promise<string> {

  // Retrieve jwks
  const jwks = await Axios.get(jwksUrl)

  // Look for the needed certificate
  let certificate: string = undefined
  jwks.data.keys.forEach(key => {
    if (key.kid === kid) {
      certificate = key.x5c[0]
    }
  });

  if (!certificate) {
    throw new Error('Could not find certificate')
  }

  return '-----BEGIN CERTIFICATE-----\n' + certificate + '\n-----END CERTIFICATE-----'
}
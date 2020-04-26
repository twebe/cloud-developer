import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = "-----BEGIN CERTIFICATE-----\r\n\
MIIDDTCCAfWgAwIBAgIJTpMkoELNNZZoMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV\r\n\
BAMTGWRldi1yN2d2dnI2ZS5ldS5hdXRoMC5jb20wHhcNMjAwNDE5MDk0MzI4WhcN\r\n\
MzMxMjI3MDk0MzI4WjAkMSIwIAYDVQQDExlkZXYtcjdndnZyNmUuZXUuYXV0aDAu\r\n\
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsU7ror03UM1kcu5s\r\n\
QW6zGGC6rcX5Wf8wQvMuI2VIONsz1woLMoTh8Q9K0dL17JiNzaRJBEUlpuaAuEdT\r\n\
orkpS47+Yvtr/M0rwKQPo8nQ0pi5Av3ajfOQ8We1PYuXU1dV2XRJ3k5bhK4IfH/m\r\n\
4YhTNrjsEIQxH5cbEBpAX+FeehvjI74pecGSO0sHXNsQIocZDvI9CwsBXa2QfDk8\r\n\
UgJhnGxvGMFrYmW0I5vKHXbPL8V/YcaubHjcjrsyHwze5fHoSOqIYXhj+pyjoTs1\r\n\
WLvQ9TwiDm+9wy8IpGsMGCHfMAIfvKH392oPdk16lRurjsZoV6sVfJBJLZwsTqFH\r\n\
1HvtvQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQUt1rFzld3\r\n\
vzd3v345L3DJsI5qJzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB\r\n\
ACbparjxz6XJVna0T4ow+JXyGV/FBi5FKT3s7PlpXxL21bzHnmI7Hs5yd5uOzN10\r\n\
z7UnyKl16a9JNWtVTOj3DXxVZaFfNhlDgkVl/BAM/bTlc5PJ3SunGIIhJrqfsGvY\r\n\
c30iqUz3oInGEV1vK2qnbJXxS28OIQPxhN0bb0zVjpQrBqarcd9ANTiCL/1rxa7d\r\n\
+ZZWvqzzopARhJ906lS3HKi9CGrgOT6QYEtBrU2iQaYiJPD0jXbFtLZHa4/JmiVW\r\n\
7MOwK48sACEUFtok/pkozSjvZnqJN3ynVwT/QJdjweXyEOFY8Le4w3yJCDd5QuRP\r\n\
0VaP6tl+i8pheXXEI7APH+U=\r\n\
-----END CERTIFICATE-----"

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(
      event.authorizationToken,
      cert
    )
    console.log('User was authorized', decodedToken)

    return {
      principalId: decodedToken.sub,
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
    console.log('User was not authorized', e.message)

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

function verifyToken(authHeader: string, cert: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(
    token,           // Token from an HTTP header to validate
    cert,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
) as JwtToken
}

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import 'source-map-support/register';

import { verify } from 'jsonwebtoken';
import { createLogger } from '../../utils/logger';
import { JwtPayload } from '../../auth/JwtPayload';

const logger = createLogger('auth');

// get in app auth0
const cert = `-----BEGIN CERTIFICATE-----
MIIDGTCCAgGgAwIBAgIJOUdz9Bgqfk7ZMA0GCSqGSIb3DQEBCwUAMCoxKDAmBgNV
BAMTH2FuaG50YzIwMDEtdWRhY2l0eS51cy5hdXRoMC5jb20wHhcNMjIxMTE0MDI1
NTI2WhcNMzYwNzIzMDI1NTI2WjAqMSgwJgYDVQQDEx9hbmhudGMyMDAxLXVkYWNp
dHkudXMuYXV0aDAuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
rpAXFxscgRP34X2vXEOcg3A2+3LXgScpJhaVQvYx1vAXLCGIRR3elqxSLcmG6WPC
xy3n0njcW2jsAvizbfQKp6DPm3F0aoaZITdVpJdp1pxPAuMWo2QlYQfNb2PQTZAG
3flHRSuoKvCIKc8ckHIdBBMsX7B8//3SAOSB+sReb9JzlatZJqW2BNEO7NxUuerp
4xfVM5tDeYMaPE5rnXa5Y+5AyGDLYntBm7RCRRL8ahGtF+Maen/ukEfyLg+X83Ur
RlBunuc4tUiDEZVIjxqqt7zd8Dp6OeQI6ZR/0LRYRP1/SR6j4pn3efQIKPjbGdcq
HyhMPdFlcHT1zC5sHlrXQwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1Ud
DgQWBBQKx87k9LQlbsty3hsb6YbJ2tAb7zAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZI
hvcNAQELBQADggEBAD/1BJe/7p69HjLGBByVOGU9qPnRzzfcDSgW5xU0ujnG07Qr
9ApjVRwpLcaKEN4sXhYXKpzwQrHo2SNaJ9U1G776I0URYx9ZPnsJ4ZBc/SH9X2y5
N3928b5yb3HR0cPGdR47dFJXH4t44LMTMFYEDGesexha8RwR0fjv9ZBrG3oGssbJ
SChT7VuDuTalhj7Gbqw0PO7pHJ4bwo1H+DYam7s74ze6D/h1qu8Lel1OH/Kud/DI
K8JtaiOUpEujtJ7v/WnbHUMWW4ta65+/JFXXgNjnsFhq2gXcdH2TgUXbw8YKYjF9
1GSdJ7KqqlLgGh2R5VOfX6MWcQgWY2BpzzK9frs=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*',
          },
        ],
      },
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*',
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader);
  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header');
  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');
  const split = authHeader.split(' ');
  const token = split[1];
  return token;
}

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import { URL } from "url";

const SCOPES = [
  "https://www.googleapis.com/auth/youtube",  // Full access for upload, update, delete
];
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "client_secrets.json");

interface Credentials {
  installed?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
  web?: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

export async function getAuthenticatedClient(): Promise<OAuth2Client> {
  // Check for existing token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(token);

    // Check if token is expired and refresh if needed
    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log("Token expired, refreshing...");
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);
      saveToken(credentials);
    }

    return oauth2Client;
  }

  // No token exists, need to authenticate
  return authenticate();
}

const REDIRECT_URI = "http://localhost:3000";

function createOAuth2Client(): OAuth2Client {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Missing ${CREDENTIALS_PATH}. Download OAuth 2.0 credentials from Google Cloud Console.`
    );
  }

  const credentials: Credentials = JSON.parse(
    fs.readFileSync(CREDENTIALS_PATH, "utf-8")
  );

  const { client_id, client_secret } =
    credentials.installed || credentials.web!;

  return new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);
}

async function authenticate(): Promise<OAuth2Client> {
  const oauth2Client = createOAuth2Client();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n=== YouTube Shorts Upload Authentication ===\n");
  console.log("1. Open this URL in your browser:\n");
  console.log(authUrl);
  console.log("\n2. Authorize the application");
  console.log("3. You will be redirected to localhost\n");

  const code = await waitForAuthCode();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  saveToken(tokens);

  console.log("Authentication successful! Token saved.\n");
  return oauth2Client;
}

function waitForAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (req.url?.startsWith("/oauth2callback") || req.url?.startsWith("/?")) {
        const url = new URL(req.url, "http://localhost:3000");
        const code = url.searchParams.get("code");

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<h1>Authentication successful!</h1><p>You can close this window.</p>"
          );
          server.close();
          resolve(code);
        } else {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Error: No authorization code received</h1>");
          server.close();
          reject(new Error("No authorization code received"));
        }
      }
    });

    server.listen(3000, () => {
      console.log("Waiting for authorization on http://localhost:3000 ...\n");
    });

    server.on("error", (err) => {
      reject(err);
    });
  });
}

function saveToken(token: any): void {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
  console.log(`Token saved to ${TOKEN_PATH}`);
}

// Run auth standalone if executed directly
if (require.main === module) {
  getAuthenticatedClient()
    .then(() => {
      console.log("Ready to upload videos!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Authentication failed:", err.message);
      process.exit(1);
    });
}

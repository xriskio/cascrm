"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon, CheckCircle2, Copy, ExternalLink } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function QQCatalystAuthGuidePage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">QQCatalyst Authentication Guide</h1>
        <p className="text-muted-foreground">
          Complete reference for understanding and implementing QQCatalyst API authentication
        </p>
      </div>

      <div className="grid gap-6">
        {/* Authentication Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Flow</CardTitle>
            <CardDescription>Visual representation of the QQCatalyst authentication process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md overflow-x-auto">
              <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre">
                {`flowchart LR
  A[Your Front-end React App] -->|calls| B[Next.js API Route<br/>(/api/qq/clients)]
  B -->|POST grant request| C[QQ OAuth Token Endpoint<br/>(https://login.qqcatalyst.com/oauth/token)]
  C -->|200 + JSON {access_token,…}| B
  B -->|GET v1/Contacts with Bearer token| D[QQCatalyst API<br/>(https://api.qqcatalyst.com/v1/...)]
  D -->|200 + JSON data| B
  B -->|upsert into| E[Supabase Database]
  E -->|serves| F[Dashboard/Your UI]`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Authentication Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Steps</CardTitle>
            <CardDescription>Step-by-step process to authenticate with QQCatalyst API</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-6 list-decimal list-inside">
              <li className="pl-2">
                <strong>POST to the QQCatalyst OAuth2 token endpoint:</strong>
                <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <code className="text-sm">https://login.qqcatalyst.com/oauth/token</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("https://login.qqcatalyst.com/oauth/token", "token-endpoint")}
                  >
                    {copied === "token-endpoint" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </li>

              <li className="pl-2">
                <strong>Include HTTP Basic Authentication header:</strong>
                <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                  <p className="text-sm mb-2">
                    Base64 encode: <code>client_id:client_secret</code>
                  </p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm">Authorization: Basic {"{base64-encoded-credentials}"}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          "Authorization: Basic " +
                            Buffer.from(
                              "44c42186-c1b7-49ae-afd4-73d77527acc1:f3f28807-ed94-409c-9e99-6e69cbec5e3e",
                            ).toString("base64"),
                          "auth-header",
                        )
                      }
                    >
                      {copied === "auth-header" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </li>

              <li className="pl-2">
                <strong>Send URL-encoded body with credentials:</strong>
                <div className="mt-2 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Key
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">grant_type</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">password</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">username</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">wael@casurance.com</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">password</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Think0202!!!</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <code className="text-sm">grant_type=password&username=wael@casurance.com&password=Think0202!!!</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        "grant_type=password&username=wael@casurance.com&password=Think0202!!!",
                        "body-params",
                      )
                    }
                  >
                    {copied === "body-params" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </li>

              <li className="pl-2">
                <strong>Parse the response JSON:</strong>
                <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md">
                  <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre">
                    {`{
  "access_token": "eyJ0eX...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "XyZaB..."
}`}
                  </pre>
                </div>
              </li>

              <li className="pl-2">
                <strong>Use the access token in API requests:</strong>
                <div className="mt-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-md flex items-center justify-between">
                  <code className="text-sm">Authorization: Bearer {"<access_token>"}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard("Authorization: Bearer <access_token>", "bearer-header")}
                  >
                    {copied === "bearer-header" ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Implementation Options */}
        <Tabs defaultValue="env">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="env">Environment Variables</TabsTrigger>
            <TabsTrigger value="helper">Token Helper</TabsTrigger>
            <TabsTrigger value="api">API Route Example</TabsTrigger>
          </TabsList>

          <TabsContent value="env">
            <Card>
              <CardHeader>
                <CardTitle>Environment Variables Setup</CardTitle>
                <CardDescription>Configure your .env file with QQCatalyst credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                  <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre">
                    {`# .env (never check into git)
QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1
QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e
QQ_USERNAME=wael@casurance.com
QQ_PASSWORD=Think0202!!!
QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token
QQ_API_BASE=https://api.qqcatalyst.com/v1`}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    copyToClipboard(
                      `QQ_CLIENT_ID=44c42186-c1b7-49ae-afd4-73d77527acc1
QQ_CLIENT_SECRET=f3f28807-ed94-409c-9e99-6e69cbec5e3e
QQ_USERNAME=wael@casurance.com
QQ_PASSWORD=Think0202!!!
QQ_TOKEN_URL=https://login.qqcatalyst.com/oauth/token
QQ_API_BASE=https://api.qqcatalyst.com/v1`,
                      "env-vars",
                    )
                  }
                >
                  {copied === "env-vars" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" /> Copy to clipboard
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="helper">
            <Card>
              <CardHeader>
                <CardTitle>Token Helper Function</CardTitle>
                <CardDescription>Next.js helper to fetch and cache QQCatalyst tokens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                  <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre">
                    {`// lib/qqcatalyst/token.ts
import fetch from 'node-fetch';

let _cache: { token: string; expires: number } | null = null;

export async function getAccessToken() {
  if (_cache && Date.now() < _cache.expires) return _cache.token;

  const params = new URLSearchParams({
    grant_type: 'password',
    username:   process.env.QQ_USERNAME!,
    password:   process.env.QQ_PASSWORD!,
  });

  const basic = Buffer.from(
    \`\${process.env.QQ_CLIENT_ID!}:\${process.env.QQ_CLIENT_SECRET!}\`
  ).toString('base64');

  const res = await fetch('https://login.qqcatalyst.com/oauth/token', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': \`Basic \${basic}\`,
    },
    body:    params.toString(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(\`Token error \${res.status}: \${txt}\`);
  }

  const { access_token, expires_in } = await res.json();
  _cache = { token: access_token, expires: Date.now() + (expires_in - 30) * 1000 };
  return access_token;
}`}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    copyToClipboard(
                      `// lib/qqcatalyst/token.ts
import fetch from 'node-fetch';

let _cache: { token: string; expires: number } | null = null;

export async function getAccessToken() {
  if (_cache && Date.now() < _cache.expires) return _cache.token;

  const params = new URLSearchParams({
    grant_type: 'password',
    username:   process.env.QQ_USERNAME!,
    password:   process.env.QQ_PASSWORD!,
  });

  const basic = Buffer.from(
    \`\${process.env.QQ_CLIENT_ID!}:\${process.env.QQ_CLIENT_SECRET!}\`
  ).toString('base64');

  const res = await fetch('https://login.qqcatalyst.com/oauth/token', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': \`Basic \${basic}\`,
    },
    body:    params.toString(),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(\`Token error \${res.status}: \${txt}\`);
  }

  const { access_token, expires_in } = await res.json();
  _cache = { token: access_token, expires: Date.now() + (expires_in - 30) * 1000 };
  return access_token;
}`,
                      "token-helper",
                    )
                  }
                >
                  {copied === "token-helper" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" /> Copy to clipboard
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Route Example</CardTitle>
                <CardDescription>Next.js API route using the token helper</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                  <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre">
                    {`// pages/api/qq/clients.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../../../lib/qqcatalyst/token';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token   = await getAccessToken();
    const qqResp  = await fetch('https://api.qqcatalyst.com/v1/Contacts', {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    if (!qqResp.ok) return res.status(qqResp.status).send(await qqResp.text());

    const clients = await qqResp.json();

    // upsert into Supabase
    const { error } = await supa
      .from('clients')
      .upsert(clients, { onConflict: 'id' });
    if (error) throw error;

    res.status(200).json({ imported: clients.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}`}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() =>
                    copyToClipboard(
                      `// pages/api/qq/clients.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAccessToken } from '../../../lib/qqcatalyst/token';
import { createClient } from '@supabase/supabase-js';

const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token   = await getAccessToken();
    const qqResp  = await fetch('https://api.qqcatalyst.com/v1/Contacts', {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    if (!qqResp.ok) return res.status(qqResp.status).send(await qqResp.text());

    const clients = await qqResp.json();

    // upsert into Supabase
    const { error } = await supa
      .from('clients')
      .upsert(clients, { onConflict: 'id' });
    if (error) throw error;

    res.status(200).json({ imported: clients.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}`,
                      "api-route",
                    )
                  }
                >
                  {copied === "api-route" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" /> Copy to clipboard
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>Quick reference for QQCatalyst authentication</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-sm">
              <li>
                <strong>POST</strong> your credentials to{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                  https://login.qqcatalyst.com/oauth/token
                </code>
              </li>
              <li>
                <strong>Grab</strong> the JSON{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">access_token</code> on success
              </li>
              <li>
                <strong>Call</strong> any{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                  https://api.qqcatalyst.com/v1/...
                </code>{" "}
                endpoint with{" "}
                <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                  Authorization: Bearer {"<access_token>"}
                </code>
              </li>
              <li>
                <strong>Persist</strong> results into Supabase via your Next.js API
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Next Steps</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p>Now that you understand the authentication flow, you can:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>
                  <Link href="/qqcatalyst/auth" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Generate a new access token
                  </Link>
                </li>
                <li>
                  <Link href="/qqcatalyst/token-status" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Check your token status
                  </Link>
                </li>
                <li>
                  <Link href="/qqcatalyst/test" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Test the API connection
                  </Link>
                </li>
                <li>
                  <Link href="/qqcatalyst" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Return to QQCatalyst dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* API Documentation Link */}
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <a
              href="https://api.qqcatalyst.com/Help"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              QQCatalyst API Documentation
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

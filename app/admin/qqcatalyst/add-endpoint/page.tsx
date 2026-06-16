"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AddEndpointPage() {
  const [endpointPath, setEndpointPath] = useState("")
  const [tableName, setTableName] = useState("")
  const [typeDefinition, setTypeDefinition] = useState("")
  const [transformer, setTransformer] = useState("")
  const [generatedCode, setGeneratedCode] = useState("")

  const generateCode = () => {
    const code = `
// Add this to your import script

// Type definition
type QQ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} = ${typeDefinition};

// Import function
async function upsert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}(token: string) {
  console.log('🔄 Fetching ${tableName}...');
  try {
    const items = await fetchAll<QQ${tableName.charAt(0).toUpperCase() + tableName.slice(1)}>('${endpointPath}', token);
    const rows = items.map((item) => (${transformer}));
    
    if (rows.length > 0) {
      const { error } = await supabase
        .from('${tableName}')
        .upsert(rows, { onConflict: 'id' });
      if (error) {
        console.error('❌ ${tableName} error', error);
        throw error;
      }
      console.log(\`✅ upserted \${rows.length} ${tableName}\`);
    }
    
    return rows.length;
  } catch (error) {
    console.log('⚠️ ${tableName} endpoint not available:', error);
    return 0;
  }
}

// Don't forget to add this function to your importAll() function:
// const ${tableName}Count = await upsert${tableName.charAt(0).toUpperCase() + tableName.slice(1)}(token);
`
    setGeneratedCode(code)
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New QQCatalyst Endpoint</CardTitle>
          <CardDescription>Generate code to import data from a new QQCatalyst API endpoint</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="endpoint">API Endpoint Path</Label>
            <Input
              id="endpoint"
              placeholder="e.g., Tasks/LastModifiedCreated"
              value={endpointPath}
              onChange={(e) => setEndpointPath(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="table">Supabase Table Name</Label>
            <Input
              id="table"
              placeholder="e.g., tasks"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="type">TypeScript Type Definition</Label>
            <Textarea
              id="type"
              placeholder={`{
  TaskID: number;
  Title: string;
  Description: string;
  DueDate: string;
  LastModified: string;
}`}
              value={typeDefinition}
              onChange={(e) => setTypeDefinition(e.target.value)}
              rows={8}
            />
          </div>

          <div>
            <Label htmlFor="transformer">Data Transformer</Label>
            <Textarea
              id="transformer"
              placeholder={`{
  id: item.TaskID,
  title: item.Title,
  description: item.Description,
  due_date: item.DueDate,
  modified_at: item.LastModified
}`}
              value={transformer}
              onChange={(e) => setTransformer(e.target.value)}
              rows={8}
            />
          </div>

          <Button onClick={generateCode} className="w-full">
            Generate Import Code
          </Button>

          {generatedCode && (
            <div>
              <Label>Generated Code</Label>
              <Textarea value={generatedCode} readOnly rows={20} className="font-mono text-sm" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Find the endpoint path in the QQCatalyst API documentation</li>
            <li>Create the corresponding Supabase table if it doesn't exist</li>
            <li>Define the TypeScript interface for the API response</li>
            <li>Create the data transformer to map API fields to database columns</li>
            <li>Copy the generated code into your import script</li>
            <li>Add the function call to your importAll() function</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

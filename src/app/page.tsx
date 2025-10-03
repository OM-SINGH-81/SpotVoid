"use client";

import React, { useState } from 'react';
import { listModelsFlow, type ModelList } from '@/ai/flows/list-models';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Header from '@/components/header';

export default function ListModelsPage() {
  const [models, setModels] = useState<ModelList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchModels = async () => {
    setIsLoading(true);
    setError(null);
    setModels(null);
    try {
      const result = await listModelsFlow(null);
      setModels(result);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available AI Models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Click the button below to fetch the list of AI models available to your API key. This will help diagnose the 'Model not found' errors.
              </p>
              <Button onClick={handleFetchModels} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Models
              </Button>

              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/50 text-destructive rounded-md">
                  <h3 className="font-bold">Error</h3>
                  <pre className="text-sm whitespace-pre-wrap font-code">{error}</pre>
                </div>
              )}

              {models && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Results:</h3>
                  <pre className="p-4 bg-muted rounded-md text-sm whitespace-pre-wrap font-code">
                    {JSON.stringify(models, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

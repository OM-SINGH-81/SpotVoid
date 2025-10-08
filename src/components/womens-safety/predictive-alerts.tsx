
"use client"

import React, { useState, useEffect } from 'react';
import { GenerateWomensSafetyAlertsOutput } from '@/ai/flows/ai-womens-safety-alerts';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

const severityConfig = {
    High: { icon: <AlertTriangle className="text-destructive" />, color: 'border-destructive/50 bg-destructive/10' },
    Medium: { icon: <Info className="text-yellow-500" />, color: 'border-yellow-500/50 bg-yellow-500/10' },
    Low: { icon: <CheckCircle className="text-green-500" />, color: 'border-green-500/50 bg-green-500/10' },
};

export default function PredictiveAlerts() {
    const [data, setData] = useState<GenerateWomensSafetyAlertsOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/womens-safety-alerts', { method: 'POST' });
                 if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(errorBody.error || "An unexpected error occurred.");
                }
                const result: GenerateWomensSafetyAlertsOutput = await response.json();
                setData(result);
            } catch (e: any) {
                console.error("Failed to fetch alerts:", e);
                setError(e.message || "Could not load alerts from the AI model.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        );
    }

    if (error) {
        return <div className="text-destructive text-sm text-center">{error}</div>;
    }

    if (!data || data.alerts.length === 0) {
        return <div className="text-muted-foreground text-sm text-center">No predictive alerts at this time.</div>;
    }

    return (
        <TooltipProvider>
            <div className="space-y-3">
                {data.alerts.map(alert => {
                    const config = severityConfig[alert.severity];
                    return (
                        <Tooltip key={alert.id}>
                            <TooltipTrigger asChild>
                                <div className={cn("flex items-center gap-3 p-3 rounded-lg border", config.color)}>
                                    <div className="flex-shrink-0">{config.icon}</div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm">{alert.title}</p>
                                        <p className="text-xs text-muted-foreground">{alert.location}</p>
                                    </div>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{alert.reason}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </TooltipProvider>
    );
}

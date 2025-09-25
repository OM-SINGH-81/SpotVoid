
"use client"

import React from 'react';

type PlaceholderCardProps = {
    message: string;
}

export default function PlaceholderCard({ message }: PlaceholderCardProps) {
    return (
        <div className="w-full h-full p-4 text-center text-sm text-muted-foreground">
            {message}
        </div>
    )
}

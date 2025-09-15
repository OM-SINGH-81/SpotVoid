"use client"

import GeneratingLoader from '@/components/ui/generating-loader';
import React from 'react';

export default function LoaderPreviewPage() {
  return (
    <div className="relative w-screen h-screen">
      <GeneratingLoader />
    </div>
  );
}

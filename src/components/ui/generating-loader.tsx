"use client"

import React from 'react';

const GeneratingLoader = () => {
  return (
    <div className="generating-loader" id="loader">
        <div className="generating-loader-wrapper">
          <span className="generating-loader-letter">G</span>
          <span className="generating-loader-letter">e</span>
          <span className="generating-loader-letter">n</span>
          <span className="generating-loader-letter">e</span>
          <span className="generating-loader-letter">r</span>
          <span className="generating-loader-letter">a</span>
          <span className="generating-loader-letter">t</span>
          <span className="generating-loader-letter">i</span>
          <span className="generating-loader-letter">n</span>
          <span className="generating-loader-letter">g</span>
          <span className="generating-loader-letter">.</span>
          <span className="generating-loader-letter">.</span>
          <span className="generating-loader-letter">.</span>
          <div className="generating-loader-circle" />
        </div>
      </div>
  );
}

export default GeneratingLoader;

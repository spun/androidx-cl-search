"use client"

import React, { useState } from 'react';

function formatDate(date: Date): string {
  const pad = (num: number) => num.toString().padStart(2, '0');

  let year = date.getUTCFullYear();
  let month = pad(date.getUTCMonth() + 1); // Months are 0-indexed
  let day = pad(date.getUTCDate());
  let hours = pad(date.getUTCHours());
  let minutes = pad(date.getUTCMinutes());
  let seconds = pad(date.getUTCSeconds());
  let milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}


export default function Home() {

  const [buildStart, setBuildStart] = useState('');
  const [buildEnd, setBuildEnd] = useState('');
  const [resultsUrl, setResultsUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear any previous result url
    setResultsUrl("")
    try {
      // Get build epochs
      const goodBuildResponse = await fetch(`https://androidx.dev/snapshots/builds/${buildStart}/artifacts/logs/STARTED`);
      const goodBuildEpoch = await goodBuildResponse.text()
      const badBuildResponse = await fetch(`https://androidx.dev/snapshots/builds/${buildEnd}/artifacts/logs/STARTED`);
      const badBuildEpoch = await badBuildResponse.text()
      console.log("Start epoch", goodBuildEpoch)
      console.log("End epoch", badBuildEpoch)
      if (goodBuildEpoch == "" || badBuildEpoch == "") return;
      // Create build dates
      const startDate = new Date(parseInt(goodBuildEpoch) * 1000);
      const endDate = new Date(parseInt(badBuildEpoch) * 1000);
      console.log("Start date", startDate)
      console.log("End date", endDate)
      // Format dates to use a date accepted by Gerrit
      const startDateFormatted = formatDate(startDate)
      const endDateFormatted = formatDate(endDate)
      console.log("Format start date", startDateFormatted)
      console.log("Format end date", endDateFormatted)
      // Url with CL search query
      const finalUrl = "https://android-review.googlesource.com/q/" + encodeURIComponent(`project:platform/frameworks/support status:merged mergedafter: {${startDateFormatted}} mergedbefore: {${endDateFormatted}}`)
      console.log("URL", finalUrl)
      setResultsUrl(finalUrl)
    } catch (error) {
      console.error('Error fetching commits:', error);
    }
  };

  return <form onSubmit={handleSubmit}>
    <input
      type="text"
      value={buildStart}
      onChange={(e) => setBuildStart(e.target.value)}
      placeholder="Start Build Number (GOOD)"
    />
    <input
      type="text"
      value={buildEnd}
      onChange={(e) => setBuildEnd(e.target.value)}
      placeholder="End Build Number (BAD)"
    />
    <button type="submit">Search Commits</button>
    {resultsUrl != "" &&
      <a href={resultsUrl} target="_blank">Go to search results</a>
    }

  </form>
}
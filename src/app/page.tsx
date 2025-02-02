"use client"

import React, { useState } from 'react';

// Format a date to the string value expected by https://android-review.googlesource.com
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

// Parse a date string from a maven-metadata.xml (e.g. 20250201002912)
function parseMetadataDate(dateStr: string): Date | null {
  if (dateStr.length !== 14 || isNaN(Number(dateStr))) {
    return null; // Invalid input
  }

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);
  const hour = parseInt(dateStr.substring(8, 10), 10);
  const minute = parseInt(dateStr.substring(10, 12), 10);
  const second = parseInt(dateStr.substring(12, 14), 10);

  // Create Date object in UTC
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

// Fetch and parse the date of a given build
async function getBuildDate(buildId: string): Promise<Date | null> {
  // Get build maven-metadata.xml from any of its artifacts
  const buildResponse = await fetch(`https://androidx.dev/snapshots/builds/${buildId}/artifacts/repository/androidx/activity/activity/maven-metadata.xml`);
  const buildText = await buildResponse.text()
  // Use regex to extract the date instead of parsing the xml text
  const buildDateMatch = buildText.match(/<lastUpdated>(.*?)<\/lastUpdated>/);
  if (buildDateMatch) {
    const dateStr = buildDateMatch[1]
    const date = parseMetadataDate(dateStr)
    return date
  } else {
    return null
  }
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
      // Get build dates
      const [startDate, endDate] = await Promise.all([
        getBuildDate(buildStart),
        getBuildDate(buildEnd),
      ])

      if (!startDate || !endDate) return;
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
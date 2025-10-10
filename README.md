# SPOTVOID: Predictive Crime Analytics Dashboard

**SPOTVOID** is a cutting-edge web application designed to help law enforcement agencies proactively "see the blind spots before crime strikes." By leveraging real-time data, AI-powered predictions, and interactive visualizations, SPOTVOID provides actionable insights to optimize patrols, anticipate criminal activity, and enhance public safety.

The platform includes a dedicated module for **Women's Safety**, offering specialized analytics to identify hotspots for harassment and generate predictive alerts.

## Key Features

-   **Interactive Crime Heatmap**: Visualize crime incidents on an interactive map with filters for date range, police station, and crime type.
-   **AI Crime Prediction**: Utilizes a Genkit flow with Google's Gemini model to analyze historical data and predict future crime trends, including daily counts and type breakdowns.
-   **Optimized Patrol Routes**: Automatically generates intelligent patrol routes based on AI predictions to ensure high-risk areas are covered efficiently.
-   **Women's Safety Dashboard**: A dedicated view focusing on crimes like harassment, providing a specific heatmap, trend analysis, and predictive alerts to protect vulnerable populations.
-   **AI Chat Assistant**: Ask natural language questions about crime data (e.g., "How many thefts happened in Connaught Place last month?") and get instant answers from an AI assistant.
-   **Dynamic & Modern UI**: Built with Next.js, ShadCN UI, and Tailwind CSS, featuring a sleek, responsive interface with dynamic background effects.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini models
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
-   **Mapping**: [Google Maps Platform](https://developers.google.com/maps)
-   **Data Visualization**: [Recharts](https://recharts.org/)
-   **Background Effects**: [Three.js](https://threejs.org/) & [Postprocessing](https://github.com/pmndrs/postprocessing)

## How the AI Prediction Works

The predictive model in this application is a powerful example of how a Large Language Model (LLM) can be used for data analysis and forecasting without traditional machine learning model training.

### 1. The Data Source: Mock Crime Data

It's important to know that this application currently uses a **mock data source** for demonstration purposes. The data is not from a live police feed.

-   **File Location**: All the crime data is stored in the file `src/lib/mock-data.ts`.
-   **What's Inside**: This file contains a large array of simulated crime incidents. Each incident has an ID, a random location in Delhi, a date from the last 90 days, a crime type (`Theft`, `Accident`, `Harassment`), and an associated police station.
-   **Data Storage**: The data is not stored in a separate database. It is held directly in the application's memory as a TypeScript array, making it very fast to access for analysis.

### 2. The AI Model: Google's Gemini

The "brain" of the operation is a powerful generative AI model from Google called **Gemini 2.5 Flash**. We access this model using **Genkit**, which is Google's framework for building AI-powered features.

-   **File Location**: The logic is defined in `src/ai/flows/ai-crime-prediction.ts`.
-   **How it Works**: Instead of training a custom model, we use a clever prompting technique. We tell the Gemini model: *"You are an AI crime analyst. Here is a summary of historical crime data (counts, locations, types). Based on these trends, predict the crime counts for the next few days and identify 3-5 likely hotspots."*

### 3. The End-to-End Workflow

When you adjust the filters on the dashboard, here’s what happens:

1.  **In-Memory Filtering**: The application imports the `crimeData` array directly from `src/lib/mock-data.ts`. It then filters this array **in memory** based on the date range, police station, and crime types you selected.
2.  **Prompting the AI**: It summarizes the filtered historical data and sends it to the Gemini model as part of a detailed prompt, asking for predictions.
3.  **Generating Predictions**: The Gemini model analyzes the patterns in the data it was given and generates a JSON response containing:
    -   Predicted daily crime counts.
    -   A breakdown of predicted crime types.
    -   A list of `predictedHotspots`, complete with coordinates, risk levels, and a reason for the prediction.
4.  **Displaying Results**: The application receives this JSON response and uses it to draw the charts and the "Predicted Hotspots" map on your screen.

In short, the application **simulates a real-world predictive system by using a powerful LLM to analyze historical data and make intelligent forecasts.** To make this a production-ready application, you would simply replace the mock data source with a live connection to a real police database.


## Getting Started (Local Development)

To run this project on your local machine, follow these steps.

### Prerequisites

-   **Node.js**: Version 18 or later.
-   **Git**: To clone the repository.

### Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/OM-SINGH-81/SpotVoid.git
    cd SpotVoid
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    Create a new file named `.env.local` in the root of your project and add the following keys.

    ```
    # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Get your API key from Google Cloud Console: https://console.cloud.google.com/google/maps-apis/credentials
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
    ```
    Replace `YOUR_API_KEY` with your actual keys.

### Running the Application

You need to run two separate processes in two different terminals for the full application to work.

1.  **Start the AI Flows (Genkit)**:
    This command starts the Genkit development server, which runs your AI flows.
    ```bash
    npm run genkit:watch
    ```

2.  **Start the Web Application (Next.js)**:
    This command starts the Next.js development server.
    ```bash
    npm run dev
    ```

Once both commands are running, open your web browser and navigate to **[http://localhost:9002](http://localhost:9002)** to see your application in action.

## Deploying to the Cloud

You can deploy this application for free using platforms like Vercel or Netlify.

### Prerequisites

-   Your code must be pushed to a Git repository (e.g., GitHub, GitLab).

### Vercel Deployment Guide

1.  **Sign Up**: Go to [vercel.com](https://vercel.com) and sign up with your Git provider.
2.  **Import Project**: From your Vercel dashboard, click "Add New... > Project" and select your repository.
3.  **Configure Environment Variables**: In the project settings under "Environment Variables," add `GEMINI_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with their respective values.
4.  **Deploy**: Click "Deploy". Vercel will automatically build and deploy your application.


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

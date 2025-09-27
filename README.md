# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally with VS Code

To run this project on your local machine using Visual Studio Code, follow these steps:

### Prerequisites

1.  **Node.js**: Make sure you have Node.js (version 18 or later) installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **VS Code**: Download and install Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com/).
3.  **Git**: You'll need Git to push your code to a repository for deployment. Download it from [git-scm.com](https://git-scm.com/).

### Setup Instructions

1.  **Open the Project**: Open the project folder in VS Code.

2.  **Install Dependencies**: Open the integrated terminal in VS Code (you can use `Ctrl+\`` or `Cmd+\``) and run the following command to install all the necessary packages:
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**:
    *   Create a new file in the root of your project named `.env.local`.
    *   Add the following lines to this file, replacing `YOUR_API_KEY` with your actual keys:

    ```
    # Get your API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Get your API key from Google Cloud Console: https://console.cloud.google.com/google/maps-apis/credentials
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
    ```

### Running the Application

You need to run two separate processes in two different terminals for the full application to work.

1.  **Start the AI Flows (Genkit)**: In your first terminal, run:
    ```bash
    npm run genkit:watch
    ```
    This will start the Genkit development server, which runs your AI flows.

2.  **Start the Web Application (Next.js)**: In a second terminal, run:
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server.

Once both commands are running, you can open your web browser and navigate to [http://localhost:9002](http://localhost:9002) to see your application in action.

## Deploying for Free with Vercel or Netlify

You can deploy this application for free using Vercel or Netlify. Both platforms provide excellent support for Next.js.

### Prerequisites

1.  **Push to a Git Repository**: Before deploying, your code must be in a Git repository (e.g., on GitHub, GitLab, or Bitbucket).
    *   Initialize a Git repository: `git init`
    *   Commit your files: `git add . && git commit -m "Initial commit"`
    *   Create a repository on your preferred platform and push your code to it.

### Option 1: Deploying with Vercel

1.  **Sign Up**: Go to [vercel.com](https://vercel.com) and sign up with your Git provider account.
2.  **Import Project**: From your Vercel dashboard, click "Add New... > Project".
3.  **Select Repository**: Choose the Git repository you just created. Vercel will automatically detect that it's a Next.js project.
4.  **Configure Environment Variables**: In the project settings, navigate to "Environment Variables". Add the `GEMINI_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` with their respective values.
5.  **Deploy**: Click "Deploy". Vercel will build and deploy your application.

### Option 2: Deploying with Netlify

1.  **Sign Up**: Go to [app.netlify.com](https://app.netlify.com) and sign up with your Git provider account.
2.  **Import Project**: From your Netlify dashboard, click "Add new site > Import an existing project".
3.  **Select Repository**: Connect to your Git provider and choose the repository for your project.
4.  **Configure Build Settings**: Netlify should automatically detect the correct build settings for a Next.js app.
5.  **Add Environment Variables**: Go to your site's settings, find the "Environment variables" section, and add your `GEMINI_API_KEY` and `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
6.  **Deploy**: Click "Deploy site". Netlify will build and deploy your site.

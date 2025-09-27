# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Running Locally with VS Code

To run this project on your local machine using Visual Studio Code, follow these steps:

### Prerequisites

1.  **Node.js**: Make sure you have Node.js (version 18 or later) installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **VS Code**: Download and install Visual Studio Code from [code.visualstudio.com](https://code.visualstudio.com/).

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

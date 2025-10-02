import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chat-assistant.ts';
import '@/ai/flows/ai-crime-prediction.ts';
import '@/ai/flows/ai-patrol-routes.ts';
import '@/ai/flows/ai-womens-safety-alerts.ts';
// This tool is imported by the chat assistant flow directly
// import '@/ai/tools/crime-data-tool.ts';

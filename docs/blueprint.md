# **App Name**: CrimeWise

## Core Features:

- Interactive Crime Heatmap: Display a geographic heatmap of crime incidents, filterable by date range, police station, and crime type (Theft, Accident, Harassment). Color-coded markers indicate crime type; hovering shows FIR details.
- AI Crime Prediction: Generate line charts predicting crime counts per day/week, and bar charts showing crime types per station. Filters update these charts dynamically.
- Optimized Patrol Routes: Display a Google Map with a polyline connecting crime hotspots, showing optimized patrol routes for the police. Marker numbers indicate the visit order.
- AI Chat Assistant: Provide an input box for users to ask questions like, "Show theft hotspots in August." Returns a filtered map, prediction chart, or list of top hotspots using a reasoning tool.
- Dynamic Filter Controls: Implement controls for filtering data by date range, police station (dropdown), and crime type (checkboxes), enabling the visualization elements to reactively update.
- Data Hover Tooltips: Display data related to the FIR_ID, Crime Type, Date/Time and Police Station as tooltips on hover for a crime indicator in the heatmap.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey authority and trustworthiness.
- Background color: Light gray (#F5F5F5), nearly desaturated blue, to provide a clean and unobtrusive backdrop.
- Accent color: Orange (#FF9800), an analogous hue to deep blue with modified saturation/brightness, for call-to-actions and important highlights.
- Body and headline font: 'Inter', a grotesque-style sans-serif, to ensure a modern and neutral look throughout the application.
- Code font: 'Source Code Pro' for displaying the occasional piece of computer code, like crime IDs.
- Minimalist icons for crime types (theft, accident, harassment) and filter options, ensuring clarity and ease of use.
- Dashboard Layout: Top section for Filters/Control Panel, Middle for Crime Hotspot Map, Bottom Left for AI Prediction Graphs, Bottom Right for Patrol Route Map.
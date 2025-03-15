# TriHard Leaderboard Dashboard

A visualization dashboard for TriHard Strata Club leaderboards. This project provides interactive charts and visualizations to track team and individual performance.

## Features

- Team comparison visualizations
- Individual leaderboards
- Score distribution analytics
- Interactive filtering and data exploration
- Responsive design for desktop and mobile viewing

## Screenshots

![Dashboard Preview](public/dashboard-preview.png)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn
- A CSV file with your leaderboard data

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/trihard-leaderboard.git
   cd trihard-leaderboard
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Add your CSV data
   - Place your CSV file in the `public` folder
   - Name it `leaderboard.csv` (or update the file path in the code)

4. Start the development server
   ```
   npm start
   ```

5. Open your browser to `http://localhost:3000`

## Deployment

### Deploy to Vercel

1. Push your code to GitHub:
   ```
   git push
   ```

2. Go to [Vercel](https://vercel.com/) and sign up/login

3. Click "New Project" and import your GitHub repository

4. Configure project settings (defaults should work fine)

5. Click "Deploy"

Vercel will automatically detect your React app, build it, and deploy it.

### Alternative: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```
   vercel
   ```

3. Follow the prompts to login and configure your project

4. For production deployment:
   ```
   vercel --prod
   ```

## Updating Data

To update your leaderboard data:

1. Replace the CSV file in the `public` folder
2. If using GitHub Pages or similar static hosting, redeploy the application

For automatic updates, consider setting up a GitHub Action to fetch data from Google Sheets and update the repository on a schedule.

## Customization

### Changing Colors

Edit the `TEAM_COLORS` and `COLORS` variables in `src/components/TriHardVisualizations.jsx` to match your team colors.

### Adding New Visualizations

1. Create a new chart component in the main visualization file
2. Add a new tab button in the tab navigation section
3. Add a conditional rendering for your new component

## Built With

- [React](https://reactjs.org/) - The web framework used
- [Recharts](https://recharts.org/) - Charting library
- [PapaParse](https://www.papaparse.com/) - CSV parsing
- [Lodash](https://lodash.com/) - Data manipulation utilities

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Thanks to all TriHard Strata Club members for their participation
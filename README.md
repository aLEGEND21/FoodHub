# FoodHub

FoodHub is a modern food tracking application that helps you monitor your daily nutrition intake, track habits, and maintain a healthy lifestyle. Built with Next.js and MongoDB, FoodHub provides an intuitive interface for logging meals, tracking calories and protein, and monitoring daily habits.

## Features

### 🍽️ Meal Tracking

- **Log Meals**: Easily add meals throughout the day with support for breakfast, lunch, dinner, and snacks
- **Flexible Serving Sizes**: Choose from 1/4, 1/3, 1/2, 2/3, 3/4, or 1 serving sizes
- **Nutrition Tracking**: Automatically calculates calories and protein based on serving size
- **Meal Organization**: View meals grouped by meal type with collapsible sections

### 📊 Daily Nutrition Dashboard

- **Calorie Tracking**: Monitor daily calorie intake against your goal (default: 2,700 calories)
- **Protein Tracking**: Track protein consumption with a daily goal (default: 90g)
- **Progress Indicators**: Visual progress bars showing how close you are to your daily goals
- **Real-time Updates**: See your nutrition stats update as you add or remove meals

### 🏋️ Habit Tracking

- **Workout Logging**: Track whether you completed your workout for the day
- **Fruit Intake**: Monitor daily fruit consumption (0, 1, or 2 fruits)
- **Visual Indicators**: Color-coded status indicators for quick habit overview

### 🍎 Food Library

- **Custom Foods**: Create your own food items with custom names, calories, protein, and emoji icons
- **Favorite Foods**: Mark frequently used foods as favorites for quick access
- **Search Functionality**: Quickly find foods in your library with real-time search
- **Food Management**: Organize and manage your personal food database

### 📅 History & Analytics

- **Meal History**: View past meal logs organized by date
- **Date Navigation**: Browse through your historical data
- **Daily Summaries**: See calories, protein, and habits for any past day
- **Detailed Views**: Expand meal sections to see individual items and their nutritional values

### 🎨 User Experience

- **Mobile-First Design**: Optimized for mobile devices with a responsive layout
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Intuitive Navigation**: Bottom navigation bar for easy access to main features
- **Clean UI**: Modern, minimalist interface built with Tailwind CSS and Radix UI components

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)
- **Theme Management**: [next-themes](https://github.com/pacocoursey/next-themes)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm/bun
- MongoDB database (local or cloud instance like MongoDB Atlas)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd foodhub
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your MongoDB connection:
   - Create a `.env.local` file in the root directory
   - Add your MongoDB connection string:

   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
foodhub/
├── app/                    # Next.js app router pages
│   ├── add-meal/           # Meal addition flow
│   ├── history/            # Meal history pages
│   └── page.tsx            # Home page (today's view)
├── components/              # React components
│   ├── ui/                 # Reusable UI components
│   ├── bottom-nav.tsx      # Bottom navigation
│   └── date-view.tsx       # Daily meal view component
├── lib/                    # Utility functions and server actions
│   ├── actions/            # Server actions for data operations
│   ├── constants.ts        # App constants (goals, etc.)
│   └── mongodb.ts          # Database connection
├── models/                 # Mongoose data models
│   ├── Food.ts             # Food model
│   ├── Meal.ts             # Meal model
│   └── Habits.ts           # Habits model
└── types/                  # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Features in Detail

### Adding Meals

1. Navigate to the "Add" tab
2. Search or browse your food library
3. Select a food item
4. Choose meal type (breakfast, lunch, dinner, snack)
5. Select serving size
6. The meal is automatically added with calculated nutrition values

### Creating Custom Foods

1. Go to "Add Meal" page
2. Click "Create Custom Food"
3. Enter food name, calories, protein, and emoji
4. The food is added to your library and can be used immediately

### Viewing History

1. Navigate to the "History" tab
2. Browse past days with logged meals
3. Click on any day to see detailed meal breakdown
4. View nutrition totals and habit status for each day

## License

This project is private and proprietary. Unauthorized reuse is not permitted.

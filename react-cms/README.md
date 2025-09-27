# Almost-a-CMS React Edition

A modern, mobile-friendly React interface for the Almost-a-CMS project.

## Features

✨ **Modern Design**
- Clean, professional interface built with Tailwind CSS
- Fully responsive and mobile-first design
- Smooth animations and transitions
- Dark mode ready (easily extendable)

🎯 **User Experience**
- Intuitive dashboard with content section cards
- Real-time JSON validation
- Auto-save functionality
- Error handling with user-friendly messages
- Loading states and progress indicators

📱 **Mobile-Friendly**
- Optimized for all screen sizes
- Touch-friendly interface
- Responsive grid layouts
- Mobile navigation patterns

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Heroicons** for consistent iconography
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 16+
- The original Flask backend running on port 5000

### Installation

1. **Install dependencies:**
   ```bash
   cd react-cms
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

### Backend Integration

The React app is configured to proxy API requests to the Flask backend:
- React app runs on `localhost:3000`
- Flask backend should run on `localhost:5000`
- API calls are automatically proxied via Vite configuration

## Usage

1. **Dashboard View**: Overview of all content sections with stats
2. **Content Cards**: Click any section to edit its JSON content
3. **JSON Editor**: Real-time syntax validation and formatting
4. **Auto-Generation**: Saves trigger automatic HTML regeneration
5. **Mobile Support**: Works seamlessly on phones and tablets

## Project Structure

```
react-cms/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── ContentCard.tsx  # Content section cards
│   │   └── JsonEditor.tsx   # JSON editing interface
│   ├── pages/              # Main application pages
│   │   └── Dashboard.tsx   # Content management dashboard
│   ├── hooks/              # Custom React hooks
│   │   └── useApi.ts       # API communication logic
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Shared interface definitions
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles and Tailwind
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Features

### 🎨 Modern UI Components

- **ContentCard**: Interactive cards for each content section
- **JsonEditor**: Full-featured JSON editor with validation
- **Layout**: Responsive layout with header and navigation
- **Dashboard**: Stats overview and content management

### 🔗 API Integration

- Seamless integration with existing Flask backend
- Real-time error handling and user feedback
- Automatic HTML generation after content updates
- Loading states for better user experience

### 📱 Responsive Design

- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface elements
- Optimized for all screen sizes

## Development

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Customization

The React app is highly customizable:

- **Colors**: Modify `tailwind.config.js` to change the color scheme
- **Components**: All components are modular and easily extendable
- **API**: Update `src/hooks/useApi.ts` for different backend endpoints
- **Layout**: Customize `src/components/Layout.tsx` for different structures

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Built with ❤️ using React + TypeScript + Tailwind CSS
# Global Settings Implementation

## Overview
This document describes the implementation of the global settings functionality with a cog icon in the sidebar and theme switching capabilities.

## Features Implemented

### 1. Theme Management System
- **Theme Context** (`src/contexts/ThemeContext.tsx` & `src/contexts/themeContext.ts`)
  - Supports Light, Dark, and Auto (system) themes
  - Automatically applies theme to the document root
  - Persists theme preference in localStorage
  - Listens for system theme changes when in "auto" mode

- **Theme Hook** (`src/contexts/useTheme.ts`)
  - Provides easy access to theme state and setter
  - Includes current actual theme (resolved from auto)

### 2. Global Settings Modal
- **Component** (`src/components/GlobalSettingsModal.tsx`)
  - Theme selection dropdown
  - AI configuration sliders (Max Tokens, Temperature)
  - Storage usage display with progress bar
  - Data export functionality
  - Responsive design with dark/light mode support

### 3. Enhanced Sidebar
- **Updated Sidebar** (`src/components/Sidebar.tsx`)
  - Added settings cog icon (IoSettings from react-icons)
  - Settings button positioned at the bottom of the sidebar
  - Proper flexbox layout to separate chat list from settings
  - Integrated GlobalSettingsModal

### 4. Application Integration
- **Main App** (`src/main.tsx`)
  - ThemeProvider wrapped around the entire application
  - Proper context hierarchy maintained

## Technical Details

### Theme Implementation
- Uses CSS classes (`dark`) on the document root
- Leverages Tailwind CSS dark mode utilities
- Automatic theme detection via `matchMedia` API
- Real-time theme switching without page reload

### Storage Management
- User preferences stored in localStorage
- Theme preference persisted across sessions
- Storage usage monitoring
- Data export/backup functionality

### UI/UX Features
- Smooth transitions between themes
- Consistent styling across light/dark modes
- Accessible form controls with proper labels
- Visual feedback for settings changes

## Usage

### Accessing Settings
1. Click the cog/settings icon in the sidebar (bottom section)
2. The Global Settings modal will open

### Changing Theme
1. Open settings modal
2. Select desired theme from dropdown:
   - **Light**: Always use light theme
   - **Dark**: Always use dark theme  
   - **Auto (System)**: Follow system preference

### Adjusting AI Settings
1. Use the Max Tokens slider (100-4000 tokens)
2. Use the Temperature slider (0.0-2.0)
3. Changes are saved automatically

### Data Management
1. View storage usage with visual progress bar
2. Export app data as JSON backup file
3. Backup includes all settings and preferences

## File Structure
```
src/
├── contexts/
│   ├── ThemeContext.tsx     # Theme provider component
│   ├── themeContext.ts      # Theme context and types
│   └── useTheme.ts          # Theme hook
├── components/
│   ├── GlobalSettingsModal.tsx  # Settings modal component
│   └── Sidebar.tsx              # Enhanced sidebar with settings
└── main.tsx                     # App with ThemeProvider
```

## Dependencies
- `react-icons/io5` - Settings cog icon
- `flowbite-react` - UI components (Modal, Select, Label)
- Existing utilities from `@/utils/localStorage`

## Future Enhancements
- Import data functionality
- Additional theme customization options
- More AI provider-specific settings
- Keyboard shortcuts for settings
- Settings search/filter functionality

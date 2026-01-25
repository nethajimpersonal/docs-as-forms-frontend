# Legal Report Form Frontend

A React application for creating, managing, and filling legal report forms with validation and file handling.

## Features

- **Create Forms** - Design custom forms with sections and fields
- **Form List** - Browse and manage all created forms
- **Fill Forms** - Complete forms with validation and automatic file download
- **Form Deletion** - Secure deletion with verification code
- **Toast Notifications** - User-friendly success and error messages
- **File Management** - Upload, view, and download documents

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── components/
│   ├── FormCreator.js    - Create new forms
│   ├── FormList.js       - List and manage forms
│   └── FormFiller.js     - Fill form fields
├── App.js                - Main application component
├── App.css               - Application styles
├── config.js             - API configuration
└── index.js              - React entry point
```

## Technologies Used

- React
- Axios (HTTP client)
- React Router
- React Toastify (Notifications)

## API Endpoints

The application connects to backend APIs configured in `src/config.js`:

- `GET /forms` - Fetch all forms
- `POST /forms` - Create new form
- `POST /forms/{id}/fill` - Submit filled form
- `DELETE /forms/{id}` - Delete form

## Features Breakdown

### Form Creation
- Add sections and fields dynamically
- Define field names, types, and unique keys
- Upload associated document files
- Real-time validation with error display

### Form Filling
- Dynamic form rendering based on sections
- Field-level error handling
- Automatic file download on submission
- Verification code for form deletion

### Error Handling
- Toast notifications for all operations
- Inline field validation errors
- Server-side error response handling

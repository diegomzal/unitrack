# UniTrack

## Description
UniTrack is an application designed to manage university applications. It allows users to track the programs they want to apply to, maintaining a centralized record with information such as program title, description, university, location, duration, useful links, personal notes, and the application status.

## Architecture
The project consists of two main parts:
- **Frontend** (`/front` folder): Developed with React and Vite.
- **Backend** (Root folder `/`): Developed with Node.js and Express.

## Data Model

The main data model proposed for the application is described below:

### `User` (User/Applicant)
- `_id`: ObjectId
- `name`: String
- `email`: String
- `password`: String (Hash)
- `createdAt`: Date
- `updatedAt`: Date

### `Application` (Application/Program)
- `_id`: ObjectId
- `userId`: ObjectId (Reference to User)
- `title`: String (e.g., "Master in Computer Science")
- `description`: String
- `university`: String (e.g., "MIT")
- `country`: String – ISO country code (e.g., "US")
- `duration`: Number – duration in years (e.g., 2)
- `links`: Array of Objects `{ name: String, url: String }` (e.g., links to requirements, admission portal)
- `notes`: String (User annotations and reminders)
- `status`: Enum ("Not started", "In progress", "Submitted", "Interview", "Accepted", "Rejected", "Waitlisted")
- `createdAt`: Date
- `updatedAt`: Date

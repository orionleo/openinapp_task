# Task Management System

This is a TypeScript-based backend for a Task Management System using Express and Sequelize. The application includes features for managing tasks, subtasks, and users. Additionally, it utilizes the Twilio API for initiating calls to users based on task priority.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Cron Job](#cron-job)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (>=14.x)
- PostgreSQL Database
- Twilio Account SID and Auth Token

## Installation

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    ```

2. **Install dependencies:**

    ```bash
    cd <project-folder>
    npm install
    ```

3. **Set up environment variables:**

    Create a `.env` file in the root directory with the following variables:

    ```env
    TWILIO_ACCOUNT_SID=<your-twilio-account-sid>
    TWILIO_AUTH_TOKEN=<your-twilio-auth-token>
    DATABASE_URL=<your-database-url>
    PORT=<port-number>
    ```

    Replace `<your-twilio-account-sid>`, `<your-twilio-auth-token>`, `<your-database-url>`, and `<port-number>` with your Twilio credentials, PostgreSQL database URL, and desired port number.

4. **Run the migrations:**

    ```bash
    npm run migrate
    ```

## Usage

Start the server:

```bash
npm start
```

The server will be running on the specified port, and the PostgreSQL database will be connected.
## Endpoints

### Users
- `POST /users/call-user`: Initiates calls to users based on task priorities.

### Tasks
- `POST /tasks/create-task`: Creates a new task.
- `GET /tasks/get-all-tasks/:userId`: Retrieves all tasks for a specific user.
- `PATCH /tasks/update-task/:taskId`: Updates task details, including due date and status.
- `DELETE /tasks/delete-task/:taskId`: Deletes a task and its associated subtasks.
- `PATCH /tasks/update-task-priority`: Updates task priorities based on due dates.

### Subtasks
- `POST /subtasks/create-subtask`: Creates a new subtask.
- `GET /subtasks/get-all-subtasks/:userId`: Retrieves all subtasks for a specific user.
- `PATCH /subtasks/update-subtask/:subTaskId`: Updates the status of a subtask.
- `DELETE /subtasks/delete-subtask/:subTaskId`: Deletes a subtask.

## Cron Job

The application includes a scheduled cron job that runs daily at midnight. This job updates task priorities based on due dates and initiates calls to users with tasks having specific status messages.

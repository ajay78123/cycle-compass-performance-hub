
# KRA/KPI Review System Backend API

This is the backend API for the KRA/KPI Review System built with FastAPI and connected to SQL Server.

## Setup Instructions

1. Install required packages:
   ```
   pip install -r requirements.txt
   ```

2. Make sure SQL Server with ODBC Driver 17 is installed on your system.

3. Update the `.env` file with your database credentials if needed.

4. Start the server:
   ```
   uvicorn main:app --reload
   ```

5. Access the API documentation at http://127.0.0.1:8000/docs

## API Documentation

The API provides endpoints for:

- Authentication
- User management
- Review cycle management
- KRA & KPI management
- Performance reviews (self and manager reviews)

## Database Schema

- **users**: Store user information
- **review_cycles**: Store review cycle information
- **review_windows**: Store review windows for each cycle
- **kras**: Store Key Result Areas
- **kpis**: Store Key Performance Indicators
- **ratings**: Store performance ratings

## Default Admin User

- Email: test@gmail.com
- Password: testpass

## Role-Based Access Control

- **Admin**: Can manage users, cycles, and view all data
- **Manager**: Can create KRAs/KPIs for direct reports, submit reviews
- **Employee**: Can create KRAs/KPIs (pending manager approval), submit self-reviews


# Project Setup Guide 

## Prerequisites
Before you start, ensure you have the following installed:
- Docker
- Docker Compose

## Getting Started

### 1. Clone the Repository
First, clone the repository to your local machine using Git:
```git clone [your-repository-url]
cd [your-repository-name]
```

### 2. Environment Setup
Create a `.env` file in the root of the project. This file will contain sensitive configurations and should **not** be committed to version control. You can use the `.env.example` file as a template. Fill in the necessary environment variables:
```bash
cp .env.example .env
# Edit the .env file with appropriate values
```

For the **DANGO_SECRET_KEY** environnement variable you must generate it using this command:
```
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```

### 3. Build and Run Docker Containers
Execute the following command to build and run the Docker containers. This command will set up the Django application and the PostgreSQL database:
```bash
docker-compose up --build
```

### 4. Initial Database Setup
After the containers are up and running, you'll need to create database tables. Run the Django migrations using the following command:
```bash
docker-compose exec web python manage.py migrate
```

### 5. Create a Superuser (Optional)
If you need to access the Django admin panel, create a superuser:
```bash
docker-compose exec web python manage.py createsuperuser
```
Follow the prompts to set up the superuser credentials.

### 6. Accessing the Application
The application should now be running and accessible at [http://localhost:8000](http://localhost:8000).

## Common Commands
- **Starting the application**: `docker-compose up`
- **Stopping the application**: `docker-compose down`
- **Delete the volumes (very useful, use this after modifying .env)**: `docker-compose down --volumes`
- **Rebuilding the application**: `docker-compose up --build`
- **Running Django management commands**: `docker-compose exec web python manage.py [command]`


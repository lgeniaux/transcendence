FROM python:3.9

WORKDIR /goinfre/usr/src/app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create a user and group named 'django'
RUN groupadd --gid 1000 django \
    && useradd --uid 1000 --gid 1000 -m django

COPY requirements.txt .
# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


# Add the frontend directory as an environment variable
ENV FRONTEND_FOLDER=/goinfre/usr/src/app/frontend


FROM python:3.9

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

# Install dependencies
COPY requirements.txt ./
RUN pip install -U --no-cache-dir -r requirements.txt
RUN pip install -U twisted[tls,http2]
# Copy project files
COPY . .

# Create a user and group named 'django'
RUN groupadd --gid 1000 django && \
    useradd --uid 1000 --gid 1000 -m django && \
    chown -R django:django /usr/src/app

USER django

RUN DJANGO_SETTINGS_MODULE=transcendence.settings python backend/manage.py collectstatic --noinput

# Add the frontend directory as an environment variable
ENV FRONTEND_FOLDER=/usr/src/app/frontend

#!/bin/bash

# Step 1: Create a new Laravel project
echo "Creating a new Laravel project..."
composer create-project --prefer-dist laravel/laravel project-name

# Step 2: Move into the project directory
cd project-name

# Step 3: Set folder permissions
echo "Setting folder permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Step 4: Create .env file
echo "Creating .env file..."
cp .env.example .env

composer install
# Step 5: Generate the application key
echo "Generating the application key..."
php artisan key:generate

# Step 6: Update .env for database connection
echo "Updating .env file for database configuration..."
sed -i 's/DB_DATABASE=laravel/DB_DATABASE=your_database/' .env
sed -i 's/DB_USERNAME=root/DB_USERNAME=your_username/' .env
sed -i 's/DB_PASSWORD=/DB_PASSWORD=your_password/' .env

# Step 7: Run database migrations
echo "Running database migrations..."
php artisan migrate

# Step 8: Start Laravel development server
echo "Starting Laravel development server..."
php artisan serve


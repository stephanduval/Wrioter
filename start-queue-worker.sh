#!/bin/bash

# Scrivener Import Queue Worker Startup Script
# This script starts the Laravel queue worker needed for processing Scrivener imports

echo "🚀 Starting Scrivener Import Queue Worker..."

# Check if queue worker is already running
if pgrep -f "queue:work" > /dev/null; then
    echo "⚠️  Queue worker is already running"
    ps aux | grep "queue:work" | grep -v grep
    exit 0
fi

# Start queue worker in background
echo "📋 Starting queue worker for Scrivener import processing..."
nohup php artisan queue:work --daemon --tries=3 --timeout=300 --queue=default > storage/logs/queue.log 2>&1 &

# Get the PID
QUEUE_PID=$!
echo "✅ Queue worker started with PID: $QUEUE_PID"

# Save PID to file for easy stopping later
echo $QUEUE_PID > storage/logs/queue.pid

echo "📄 Queue worker logs: storage/logs/queue.log"
echo "🛑 To stop: kill \$(cat storage/logs/queue.pid)"
echo "📊 To monitor: tail -f storage/logs/queue.log"

# Wait a moment and verify it's running
sleep 2
if kill -0 $QUEUE_PID 2>/dev/null; then
    echo "✅ Queue worker is running successfully!"
else
    echo "❌ Queue worker failed to start!"
    exit 1
fi
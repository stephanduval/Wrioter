#!/bin/bash

# Stop Queue Worker Script

echo "🛑 Stopping Scrivener Import Queue Worker..."

# Check if PID file exists
if [ -f "storage/logs/queue.pid" ]; then
    QUEUE_PID=$(cat storage/logs/queue.pid)
    echo "📋 Found PID: $QUEUE_PID"
    
    # Check if process is running
    if kill -0 $QUEUE_PID 2>/dev/null; then
        echo "🔄 Stopping queue worker (PID: $QUEUE_PID)..."
        kill $QUEUE_PID
        sleep 2
        
        # Force kill if still running
        if kill -0 $QUEUE_PID 2>/dev/null; then
            echo "💀 Force killing queue worker..."
            kill -9 $QUEUE_PID
        fi
        
        echo "✅ Queue worker stopped"
        rm -f storage/logs/queue.pid
    else
        echo "⚠️  Queue worker with PID $QUEUE_PID is not running"
        rm -f storage/logs/queue.pid
    fi
else
    echo "📄 No PID file found, checking for running processes..."
    
    # Kill any running queue workers
    pkill -f "queue:work"
    
    if [ $? -eq 0 ]; then
        echo "✅ Queue workers stopped"
    else
        echo "ℹ️  No queue workers were running"
    fi
fi
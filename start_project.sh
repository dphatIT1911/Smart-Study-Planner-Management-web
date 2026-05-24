#!/bin/bash

# Smart Study Planner Management - Start Services for macOS/Linux

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}  Smart Study Planner Management - Start Script (macOS/Linux)${NC}"
echo -e "${GREEN}========================================================${NC}"
echo ""

# Checking Python version
echo "Checking Python version..."
PYTHON_BIN="python3"
if ! command -v python3 &> /dev/null; then
    if command -v python &> /dev/null; then
        PYTHON_BIN="python"
    else
        echo -e "${RED}[ERROR] Python is not installed. Please install Python 3.12+ and try again.${NC}"
        exit 1
    fi
fi

PYTHON_VERSION=$($PYTHON_BIN -c 'import sys; print(".".join(map(str, sys.version_info[:2])))' 2>/dev/null)
echo "Python version: $PYTHON_VERSION"

if [[ "$PYTHON_VERSION" != "3.12" ]]; then
    echo -e "${YELLOW}========================================================${NC}"
    echo -e "${YELLOW}[WARNING] Du an nay hoat dong tot nhat tren Python 3.12.x${NC}"
    echo -e "${YELLOW}[WARNING] Phien ban Python hien tai la: $PYTHON_VERSION${NC}"
    echo -e "${YELLOW}Co the xay ra loi khong tuong thich thu vien khi chay Local.${NC}"
    echo -e "${YELLOW}Khuyen nghi: Chay bang Docker neu ban gap su co.${NC}"
    echo -e "${YELLOW}========================================================${NC}"
    echo ""
fi

echo "Please choose how to run the Backend (BE):"
echo "[1] Run BE in Local environment (Python virtual environment)"
echo "[2] Run BE with Docker (docker-compose)"
echo ""
read -p "Enter your choice (1 or 2): " be_mode
echo ""

BE_PID=""
FE_PID=""

# Function to clean up background processes on script exit/interrupt
cleanup() {
    echo ""
    echo -e "${GREEN}========================================================${NC}"
    echo -e "${GREEN}Stopping all running services...${NC}"
    echo -e "${GREEN}========================================================${NC}"
    if [ -n "$BE_PID" ]; then
        echo "Stopping Backend (PID: $BE_PID)..."
        kill -9 $BE_PID 2>/dev/null
    fi
    if [ -n "$FE_PID" ]; then
        echo "Stopping Frontend (PID: $FE_PID)..."
        kill -9 $FE_PID 2>/dev/null
    fi
    exit 0
}

# Trap CTRL+C, terminal closing, and script termination
trap cleanup SIGINT SIGTERM EXIT

echo -e "${GREEN}========================================================${NC}"
echo "Starting Backend (BE)..."
echo -e "${GREEN}========================================================${NC}"

cd backend

if [ "$be_mode" = "1" ]; then
    echo "Mode: Local Virtual Environment"
    if [ ! -d ".venv" ]; then
        echo "Creating Python virtual environment..."
        $PYTHON_BIN -m venv .venv
    fi
    echo "Activating virtual environment..."
    source .venv/bin/activate
    echo "Installing Backend dependencies..."
    pip install -r requirements.txt
    echo "Running database migrations..."
    alembic upgrade head
    echo "Seeding database with mock data and test account..."
    python seed_mock_data.py
    echo "Starting Uvicorn server..."
    uvicorn app.main:app --reload &
    BE_PID=$!
    cd ..
elif [ "$be_mode" = "2" ]; then
    echo "Mode: Docker"
    echo "Starting docker-compose..."
    docker-compose up --build &
    BE_PID=$!
    cd ..
else
    echo -e "${RED}Invalid choice for Backend. Skipping Backend startup...${NC}"
    cd ..
fi

echo "Waiting a moment for Backend to initialize..."
sleep 3

echo -e "${GREEN}========================================================${NC}"
echo "Starting Frontend (FE)..."
echo -e "${GREEN}========================================================${NC}"

cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Frontend dependencies..."
    npm install
fi
echo "Starting Frontend server..."
npm run dev &
FE_PID=$!
cd ..

echo "Waiting for Frontend to initialize..."
sleep 3

echo ""
echo -e "${GREEN}========================================================${NC}"
echo -e "${GREEN}All requested services have been launched!${NC}"
echo -e "${GREEN}Web App is running at: http://localhost:5173${NC}"
echo -e "${GREEN}Press Ctrl+C to stop all services.${NC}"
echo -e "${GREEN}========================================================${NC}"

# Keep script running and wait for background processes
wait $BE_PID $FE_PID

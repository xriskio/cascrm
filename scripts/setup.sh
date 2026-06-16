#!/bin/bash

echo "🚀 Setting up Insurance Portal project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Determine package manager
if [ -f "yarn.lock" ]; then
    echo "📦 Using Yarn package manager"
    if ! command -v yarn &> /dev/null; then
        echo "❌ Yarn is not installed. Installing yarn..."
        npm install -g yarn
    fi
    yarn install
    echo "✅ Dependencies installed with Yarn"
elif [ -f "package-lock.json" ]; then
    echo "📦 Using NPM package manager"
    npm ci
    echo "✅ Dependencies installed with NPM"
else
    echo "📦 No lock file found. Using NPM to install dependencies..."
    npm install
    echo "✅ Dependencies installed with NPM"
    echo "📝 package-lock.json has been generated"
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev    - Start development server"
echo "   npm run build  - Build for production"
echo "   npm run start  - Start production server"
echo ""

### MAD_Backend

### Overview
The **MAD_Backend** repository is the server-side component for the MAD (Mobile Application Development) project. It provides APIs and backend functionality for the corresponding frontend mobile app.

### Project Structure
- **`src/`**: Main source code containing API endpoints and business logic.
- **`.gitignore`**: Specifies files and directories ignored by Git.
- **`package.json`**: Project dependencies and scripts.
- **`package-lock.json`**: Locks dependency versions.

# Installation

If you’d like to contribute:  
1. **Clone this repo**
```bash
git clone https://github.com/Mario5T/MAD_Backend.git
```
2. Open it in **VS Code**  
3. Run:  
```bash
npm install
```

Create a `.env` file (optional) to override defaults:
```
MONGO_URI="your-mongodb-atlas-uri"
MONGO_DB="mad_backend"
JWT_SECRET="your-secret"
```

Start the server:
```bash
npm run dev
```

# Power Up – Portfolio Builder (CS100 Final Project)

A web app for building a personal portfolio. Users create a profile, add portfolio items with a reflection and an evidence link, and view them on the same page. The Node.js server validates all input and stores data as a JSON file on the server (AWS EC2).

- **Public URL:** http://52.87.218.48:3000
- **Repository:** https://github.com/tanyawutPhetrchu/Final-Project-Cs100

> The public IP changes if the EC2 instance is stopped and started again. Use the IP above for the demo.

## Tech Stack

- Frontend: HTML, CSS, JavaScript, Bootstrap 5.3.8
- Backend: Node.js 18+, Express 5
- Storage: `data/portfolios.json` (read and written only by the server)
- Deployment: AWS EC2 (Ubuntu), pm2

## Project Structure

```
.
├── server.js             # Express server, validation, JSON storage
├── package.json
├── data/
│   └── portfolios.json   # Saved data (outside public/, not downloadable by URL)
└── public/               # Only this folder is served to browsers
    ├── index.html
    ├── css/style.css
    └── js/script.js
```

## Installation

Requirements: Node.js 18 or newer, npm, git.

```bash
git clone https://github.com/tanyawutPhetrchu/Final-Project-Cs100.git
cd Final-Project-Cs100
npm install
```

## Run

### Locally

```bash
node server.js
```

Open http://localhost:3000. Use another port with `PORT=8080 node server.js`.
`data/portfolios.json` is created automatically if it does not exist.

### On AWS EC2 (Ubuntu)

1. Launch an Ubuntu EC2 instance. In the Security Group open only:
   - port 22 (SSH) from your own IP
   - port 3000 (web) from anywhere
2. SSH in, then install and start the app:

```bash
sudo apt update
sudo apt install -y nodejs npm git
git clone https://github.com/tanyawutPhetrchu/Final-Project-Cs100.git
cd Final-Project-Cs100
npm install
sudo npm install -g pm2
pm2 start server.js --name cs100
pm2 startup
pm2 save
```

pm2 keeps the server running and restarts it after a reboot.
Check status with `pm2 status`, logs with `pm2 logs cs100`.

## How to Use the Website

**Create a portfolio**
1. Click **Create Portfolio** and fill in your **User Profile** (optionally click **Save Profile Only**).
2. Fill in the **Portfolio Item** and **Reflection**, including an Evidence URL starting with `http://` or `https://`.
3. Click **Save Portfolio Item**. It appears under **Saved Portfolios**.

**Import item JSON**
1. Create the profile for that Student ID first.
2. Click **Import**, enter the Student ID, paste the item JSON, and click **Import**.

```json
{
  "title": "Project name",
  "type": "Project",
  "date": "2026-11-01",
  "role": "Developer",
  "description": "Short description",
  "skills": ["HTML", "JavaScript"],
  "reflection": {
    "whatIDid": "...",
    "whatILearned": "...",
    "challenge": "...",
    "nextStep": "..."
  },
  "evidence": ["https://example.com"]
}
```

**Delete:** use the delete buttons on a saved portfolio or on a single item.

## Testing

Open the website at http://52.87.218.48:3000 and follow these steps.

### Test 1: Data is saved on the server
1. Open the website in Browser A (for example Chrome) and save a portfolio item.
2. Open the same website in Browser B (another browser, or another computer or phone).
3. The item you saved must appear in Browser B too.
4. Restart the server on EC2: `pm2 restart cs100`. Reload the page. The data must still be there.
5. Reboot EC2: `sudo reboot`. Wait 1 minute, then reload the page. The data must still be there.

### Test 2: Wrong data is rejected
Try each case below. The website must show an error message and must not save anything.

| What to try | Expected result |
|---|---|
| Leave required fields empty | Error message |
| Email without `@` (for example `abc.com`) | Error message |
| Student ID with letters (for example `abc`) | Error message |
| Evidence URL without `http://` or `https://` | Error message |
| Import broken JSON (for example `hello`) | Error message |

The server checks the data again by itself, even if the browser already checked it.

### Test 3: The data file cannot be downloaded
Open these links in your browser. Both must show "Cannot GET" (error 404), not a file.

- http://52.87.218.48:3000/data/portfolios.json
- http://52.87.218.48:3000/server.js

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/portfolios` | Get all portfolios |
| POST | `/api/portfolios` | Save profile + new item, or import an item (`"action": "import"`) |
| POST | `/api/profiles` | Create or update a profile only |
| DELETE | `/api/portfolios/:studentId` | Delete a whole portfolio |
| DELETE | `/api/portfolios/:studentId/items/:itemId` | Delete one item |
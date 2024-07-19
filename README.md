Access Key Manager
This repository contains an access key manager for a multitenant school management software, built with NodeJS, Express, and MongoDB.

Live URL
Coming soon...

Features Implemented
Admin
Login with email and password
Revoke a user's password
See all keys generated on the platform (active, expired, revoked)
Retrieve a school's active access key using school email
IT Personnel
Signup and login using email and password
Verify account after signing up
Reset account password
Generate new active key if no active key is available
See all keys granted to user on the platform (active, expired, revoked)
See details of each key (status, date of procurement, expiry date)
Getting Started
1. Clone the project
Edit
Copy code
git clone #####
2. Change to project directory
Edit
Copy code
cd Access-key-manager/
3. Set up environment variables in env file
4. Install the various packages used in project
Edit
Copy code
npm install
5. Start server
Edit
Copy code
nodemon app.js
ER Diagram



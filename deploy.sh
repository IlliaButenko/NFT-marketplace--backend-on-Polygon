#bash

pm2 delete api
npm run build
pm2 start dist/main.js --name api 

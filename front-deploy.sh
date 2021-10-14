npm install
npm run build
aws s3 rm s3://chronos.pucp.cloudns.nz/ --recursive
aws s3 cp ./dist/ s3://chronos.pucp.cloudns.nz/ --recursive
npm run serve
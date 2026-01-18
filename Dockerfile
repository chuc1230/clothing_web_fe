# base image 
FROM node:20

# thiet lap thu muc lam viec cho container
WORKDIR /app/frontend

# sao chep file package*.json 
COPY package*.json ./

# cai dat cac dependencies 
RUN npm install

# sao chep toan bo source code vao container
COPY . .

# thiet lap port cho container
EXPOSE 3000

# chay ung dung
CMD ["npm", "start"]
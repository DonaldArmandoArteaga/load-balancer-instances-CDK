sudo yum update -y
sudo yum install httpd -y
echo "<html><body><h1>Hello!!! I am Donald Torres!</h1></body></html>" > /var/www/html/index.html
systemctl start httpd
systemctl enable httpd
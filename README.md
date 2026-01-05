# GatePass Management System

The **GatePass Management System** is a Django-based web application designed to automate gate pass requests, approvals, and record management within an organization.

This document provides **complete step-by-step instructions** to install, configure, and run the project on **Ubuntu Linux**, starting from system setup to running the application in a browser.

---

## 🛠️ Technology Stack

- Python 3
- Django
- SQLite (default database)
- HTML, CSS, Bootstrap
- Git
- Ubuntu Linux

---


Update system packages and install required dependencies:

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv git

#Verify Installation
python3 --version
pip3 --version
git --version


#Install Virtual Env
python3 -m venv venv
source venv/bin/activate


#Install Dependencies
pip install --upgrade pip
pip install -r requirements.txt

#Environment Configurations
nano .env
SECRET_KEY=your_django_secret_key
DEBUG=True

#Database Setup and Migrations
python manage.py makemigrations
python manage.py migrate

#Create Superadmin
python manage.py createsuperuser

#Run
python manage.py runserver

#Application Url
http://127.0.0.1:8000/

#Admin Panel
http://127.0.0.1:8000/admin/


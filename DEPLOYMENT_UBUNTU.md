# Ubuntu Server Deployment Guide

This guide explains how to transfer and run the WhatsApp Monitoring Dashboard on an **Ubuntu Linux VPS** (AWS EC2, DigitalOcean, Hetzner, Linode, GCP, or bare metal).

---

## 1. Quick Start (1-Command Setup)

On your Ubuntu server, inside the project folder:

```bash
chmod +x setup.sh deploy.sh
sudo ./setup.sh
```

`setup.sh` automatically:
1. Installs Docker and Docker Compose (if not already installed).
2. Sets up your `.env` configuration file from `.env.example`.
3. Builds the multi-stage images for frontend (Nginx/React) and API/Worker (NestJS).
4. Launches all 6 containers with health checks.
5. Runs Prisma database migrations and seeds initial demo data with Indian names.

---

## 2. Fast Redeploy Script (`deploy.sh`)

Whenever you push new code or make changes, pull and update in one command:

```bash
./deploy.sh
```

This rebuilds only the updated code, restarts the containers cleanly, and runs database migrations.

---

## 3. How to Copy Files from Your Local PC to Ubuntu

You can upload your files to the server using **SCP** or **Rsync** from your local machine:

```powershell
# Run from your local terminal (replace <SERVER_IP> and your SSH key if used)
scp -r C:\Users\navee\Desktop\whatsapp ubuntu@<SERVER_IP>:~/whatsapp
```

*(Note: You do not need to copy `node_modules` or `.git` because Docker builds everything cleanly inside containers).*

---

## 4. Useful Operations & Commands

| Task | Command |
| :--- | :--- |
| **Check container health & ports** | `docker compose ps` |
| **View live logs (all services)** | `docker compose logs -f` |
| **View API and Worker logs** | `docker compose logs -f api worker` |
| **Stop all services** | `docker compose down` |
| **Restart services** | `docker compose restart` |
| **Open Postgres SQL shell** | `docker compose exec postgres psql -U whatsapp -d whatsapp_monitor` |
| **Re-run Seed Script** | `docker compose exec api node dist/src/prisma/seed.js` |

---

## 5. Production Domain & Free SSL (Let's Encrypt HTTPS)

To add HTTPS with your custom domain (e.g. `whatsapp.yourcompany.com`):

```bash
# 1. Install Certbot
sudo apt-get install -y certbot

# 2. Temporarily stop port 80 to issue certificate
docker compose down

# 3. Generate certificate
sudo certbot certonly --standalone -d whatsapp.yourcompany.com

# 4. Start Docker back up
docker compose up -d
```

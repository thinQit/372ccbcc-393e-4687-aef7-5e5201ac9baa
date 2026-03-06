#!/bin/bash
set -e
npm install
cp .env.example .env || true
npx prisma generate

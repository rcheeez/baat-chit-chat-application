#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

echo "Stopping and removing Docker containers..."
docker stop $(docker ps -aq) || true
docker rm $(docker ps -aq) || true

echo "Removing all Docker images..."
docker rmi -f $(docker images -q) || true

echo "Uninstalling Docker..."
sudo apt-get remove -y --purge docker.io
sudo rm -rf /var/lib/docker
sudo rm -rf /var/run/docker.sock

echo "Stopping and removing Jenkins..."
sudo systemctl stop jenkins || true
sudo apt-get remove -y --purge jenkins
sudo rm -rf /var/lib/jenkins
sudo rm -rf /etc/jenkins
sudo rm -rf /usr/share/keyrings/jenkins-keyring.asc
sudo rm -rf /etc/apt/sources.list.d/jenkins.list

echo "Removing SonarQube container..."
docker stop $(docker ps -q --filter "ancestor=sonarqube:lts-community") || true
docker rm $(docker ps -q --filter "ancestor=sonarqube:lts-community") || true

echo "Uninstalling Trivy..."
sudo apt-get remove -y --purge trivy
sudo rm -rf /usr/share/keyrings/trivy.gpg
sudo rm -rf /etc/apt/sources.list.d/trivy.list

echo "Deleting Kubernetes (Kind) cluster..."
kind delete cluster --name ag-cluster || true
sudo rm -rf ~/.kube

echo "Removing Kind binary..."
sudo rm -f /usr/local/bin/kind

echo "Removing Kubectl binary..."
sudo rm -f /usr/local/bin/kubectl

echo "Removing dependencies and cleaning up..."
sudo apt-get autoremove -y
sudo apt-get clean
sudo rm -rf /var/lib/apt/lists/*

echo "All installed tools have been removed. System cleanup complete!"
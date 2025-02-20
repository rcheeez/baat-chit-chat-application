#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status

# Update package list and install Docker
echo "Updating package list and installing Docker..."
sudo apt update
sudo apt install docker.io -y
sudo chmod 666 /var/run/docker.sock

# Install Jenkins
echo "Installing Jenkins..."
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y openjdk-17-jre-headless
sudo apt-get install -y jenkins

sudo systemctl enable jenkins
sudo systemctl start jenkins
sudo systemctl status jenkins --no-pager

# Run SonarQube in a Docker container
echo "Running SonarQube..."
docker run -p 9000:9000 -d sonarqube:lts-community

# Install Trivy for image scanning
echo "Installing Trivy..."
sudo apt-get install -y wget apt-transport-https gnupg lsb-release
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install -y trivy

# Install Kind (Kubernetes in Docker)
echo "Installing Kind..."
[ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.26.0/kind-linux-amd64
chmod +x ./kind
sudo cp ./kind /usr/local/bin/kind

# Install Kubectl
echo "Installing Kubectl..."
VERSION="v1.30.0"
URL="https://dl.k8s.io/release/${VERSION}/bin/linux/amd64/kubectl"
INSTALL_DIR="/usr/local/bin"

curl -LO "$URL"
chmod +x kubectl
sudo mv kubectl $INSTALL_DIR/
kubectl version --client

# Clean up installation files
rm -f kubectl
rm -rf kind

echo "Kind & Kubectl installation complete."

# Create a Kind cluster
echo "Initializing Kind Cluster..."
kind create cluster --config config.yml --name ag-cluster

kubectl cluster-info

echo "Waiting for all nodes to be up and ready..."
sleep 5
kubectl get nodes

echo "Setup complete. Docker, Jenkins, SonarQube, Trivy, Kind, and Kubectl are installed and running."


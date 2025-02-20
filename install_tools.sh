#!/bin/bash

set -e  # Exit immediately if a command fails

echo "Updating package list..."
sudo apt update

# Install Docker & Grant Permission
echo "Installing Docker..."
sudo apt install -y --no-install-recommends docker.io
sudo chmod 666 /var/run/docker.sock

# Install Jenkins in the Background
echo "Installing Jenkins..."
(
    sudo wget -qO /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
    echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    sudo apt update
    sudo apt install -y --no-install-recommends openjdk-17-jre-headless jenkins
    sudo systemctl enable jenkins
    sudo systemctl start jenkins
) &

# Run SonarQube in the Background
echo "Starting SonarQube..."
docker run -p 9000:9000 -d sonarqube:lts-community &

# Install Trivy (Vulnerability Scanner)
echo "Installing Trivy..."
(
    sudo apt-get install -y --no-install-recommends wget apt-transport-https gnupg lsb-release
    wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
    echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
    sudo apt-get update
    sudo apt-get install -y --no-install-recommends trivy
) &

# Install Kind (Kubernetes in Docker) & Kubectl
echo "Installing Kind & Kubectl..."
(
    [ $(uname -m) = x86_64 ] && curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.26.0/kind-linux-amd64
    chmod +x ./kind
    sudo mv ./kind /usr/local/bin/kind

    VERSION="v1.30.0"
    curl -LO "https://dl.k8s.io/release/${VERSION}/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    kubectl version --client
) &

wait  # Wait for all background processes to finish

echo "Creating Kind Cluster..."
kind create cluster --config config.yml --name ag-cluster

kubectl cluster-info

echo "Waiting for cluster nodes to stabilize..."
sleep 10
kubectl get nodes

echo "Setup complete. Docker, Jenkins, SonarQube, Trivy, Kind, and Kubectl are installed and running."

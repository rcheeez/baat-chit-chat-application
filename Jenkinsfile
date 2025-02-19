pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "guravarchies/baatchit-app"
        DOCKER_TAG = "latest"
        K8S_NAMESPACE = "chat-app"
    }

    tools {
        nodejs "NodeJS" // Assuming you have a NodeJS tool configured in Jenkins
        dockerTool "Docker" // Assuming you have a Docker tool configured in Jenkins
    }

    stages {
        stage('Git Checkout') {
            steps {
                sh 'git clone https://github.com/rcheeez/baatchit-app.git'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Test App') {
            steps {
                sh 'npm test'
            }
        }

        stage('SonarQube Code Scan') {
            environment {
                scannerHome = tool 'SonarQubeScanner'
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh "${scannerHome}/bin/sonar-scanner"
                }
            }
        }

        stage('Dependency Scan') {
            steps {
                sh 'npm audit'
            }
        }

        stage('Image Scan') {
            steps {
                sh 'trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}'
            }
        }

        stage('Docker Build & Tag') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }

        stage('Docker Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                    }
                }
            }
        }

        stage('Apply K8s Deployment and Namespace Manifests') {
            steps {
                sh 'kubectl apply -f k8s/namespace.yml'
                sh 'kubectl apply -f k8s/deployment.yml'
            }
        }

        stage('Apply Services and Secrets') {
            steps {
                sh 'kubectl apply -f k8s/services.yml'
                sh 'kubectl apply -f k8s/secret.yml'
            }
        }

        stage('Verify Deployment & Services') {
            steps {
                sh 'kubectl get all -n ${K8S_NAMESPACE}'
            }
        }

        stage('Port-Forward to Run the Application Live') {
            steps {
                sh 'kubectl port-forward svc/baatchit-app-svc 3000:80 --address=0.0.0.0 -n ${K8S_NAMESPACE} &'
            }
        }
    }
}
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "guravarchies/baatchit-app"
        DOCKER_TAG = "latest"
        K8S_NAMESPACE = "chat-app"
    }

    tools {
        nodejs "NodeJS" // Assuming you have a NodeJS tool configured in Jenkins
        dockerTool "docker" // Assuming you have a Docker tool configured in Jenkins
    }

    stages {
        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/rcheeez/baatchit-app.git'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm install'
                sh 'CI=true npm run build'
            }
        }

        stage('SonarQube Code Scan') {
            environment {
                scannerHome = tool 'sonarqube'
            }
            steps {
                withSonarQubeEnv('sonar-token') {
                    sh '''${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=baatchit-app \
                        -Dsonar.projectName=baatchit-app \
                        -Dsonar.projectVersion=1.0 \
                        -Dsonar.sources=.\
                        -Dsonar.exclusions= node_modules/**,coverage/** \
                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        stage('Security & Dependency Scanning') {
            steps {
                sh 'npm audit --audit-level=critical || true'
                sh 'trivy image ${DOCKER_IMAGE}:${DOCKER_TAG}'
            }
        }

        stage('Docker Build & Tag') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                }
            }
        }

        stage('Docker Push to Docker Hub') {
            steps {
                script {
                    withDockerRegistry(url: 'https://index.docker.io/v1/', credentialsId: 'docker-credentials') {
                        sh 'docker push ${DOCKER_IMAGE}:${DOCKER_TAG}'
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig(clusterName: 'ag-cluster', contextName: '', credentialsId: 'k8s-token', namespace: 'chat-app', restrictKubeConfigAccess: false, serverUrl: 'https://127.0.0.1:37423') {
                    sh 'kubectl apply -f k8s/secret.yml'
                    sh 'kubectl apply -f k8s/deployment.yml'
                    sh 'kubectl apply -f k8s/service.yml'

                }
            }
        }

        stage('Verify Deployment & Services') {
            steps {
                withKubeConfig(clusterName: 'ag-cluster', contextName: '', credentialsId: 'k8s-token', namespace: 'chat-app', restrictKubeConfigAccess: false, serverUrl: 'https://127.0.0.1:37423') {
                    sh 'kubectl get all -n ${K8S_NAMESPACE}'
                }
            }
        }

        stage('Port-Forward to Run the Application Live') {
            steps {
                withKubeConfig(clusterName: 'ag-cluster', contextName: '', credentialsId: 'k8s-token', namespace: 'chat-app', restrictKubeConfigAccess: false, serverUrl: 'https://127.0.0.1:37423') {
                    sh 'kubectl port-forward svc/baatchit-app-svc 3000:80 --address=0.0.0.0 -n ${K8S_NAMESPACE} &'
                }
            }
        }
    }
}
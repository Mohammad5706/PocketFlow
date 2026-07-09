$ErrorActionPreference = 'Stop'

Write-Host "Creating Maven directory..."
New-Item -ItemType Directory -Force -Path "maven" | Out-Null

Write-Host "Downloading Apache Maven 3.9.6..."
$url = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"
$zipFile = "maven.zip"
Invoke-WebRequest -Uri $url -OutFile $zipFile

Write-Host "Extracting Apache Maven..."
Expand-Archive -Path $zipFile -DestinationPath "maven" -Force

Write-Host "Maven downloaded and extracted successfully."
Remove-Item $zipFile

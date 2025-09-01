#!/usr/bin/env python3
"""
Simple build script for Vercel deployment
"""
import os
import subprocess
import shutil

def main():
    print("Installing Python dependencies...")
    subprocess.run(["pip", "install", "-r", "requirements.txt"], check=True)
    
    print("Building MkDocs site...")
    subprocess.run(["mkdocs", "build"], check=True)
    
    print("Moving site contents to root for Vercel...")
    # Copy site contents to root directory for easier serving
    if os.path.exists("site"):
        for item in os.listdir("site"):
            src = os.path.join("site", item)
            dst = item
            if os.path.exists(dst):
                if os.path.isdir(dst):
                    shutil.rmtree(dst)
                else:
                    os.remove(dst)
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
        print("Build completed successfully!")
    else:
        print("ERROR: site directory not found!")
        exit(1)

if __name__ == "__main__":
    main()
"""
Setup configuration for Real Estate Flip Tracker Backend
"""

from setuptools import setup, find_packages

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [
        line.strip() for line in fh if line.strip() and not line.startswith("#")
    ]

setup(
    name="real-estate-tracker-backend",
    version="0.1.0",
    author="Real Estate Tracker Team",
    description="Backend for the Real Estate Flip Tracker - CLI and API",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "real-estate-tracker=src.cli:main",
        ],
    },
    package_data={
        "src": ["*.py"],
    },
    include_package_data=True,
)

# Almost-a-CMS for vCard – Personal Portfolio

This repository contains a **very basic Content Management System (almost-a-cms)** for generating websites on GitHub using the [vCard – Personal Portfolio](https://github.com/codewithsadee/vcard-personal-portfolio) template developed by codewithsadee. It was created as part of the GitHub Copilot Challenge: New Beginnings.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Screenshots / Demo](#screenshots--demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [1. Command-Line Generation](#1-command-line-generation)
  - [2. Flask Backend](#2-flask-backend)
- [Project Structure](#project-structure)
- [Copilot Experience](#copilot-experience)
- [GitHub Models](#github-models)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

**Goal**: Simplify the editing of static fields in the `vCard – Personal Portfolio` template by separating the site’s content into JSON files, then automatically generating an `index.html` from these JSON files using Python and Jinja2. We also built a minimal Flask backend to enable edits via a local web interface.

---

## Features

- **JSON-based content management**: Each site section has its own `.json` file, making content updates simple.
- **Auto-generate HTML**: A Python script (`index_html_generator.py`) reads the JSON data and populates the HTML template.
- **Flask editing interface**: Run a small Flask server (`app.py`) to edit JSON files in a basic GUI. Saving changes triggers the HTML rebuild.
- **Easily deployable**: Once you’ve generated the final `index.html`, push it to GitHub to publish with GitHub Pages.

---

## Screenshots / Demo

To see the demo for the two approaches (direct json/backend modification), please refer for the moment check the post on dev.to [post](https://dev.to/fedro_ita/building-a-mini-cms-for-vcard-personal-portfolio-with-github-copilot-768)

A version on github of the demo will be published soon.

---

## Getting Started

### Prerequisites

- **Python** 3.10+ (recommended)
- [pip](https://pip.pypa.io/en/stable/installation/) for installing dependencies
- [miniconda](https://docs.anaconda.com/miniconda/install/) as alternative to pip for installing dependencies

### Installation

1. **Clone this repository** (or fork and then clone):
```
git clone https://github.com/your-username/almost-a-cms-vcard.git
cd almost-a-cms-vcard
```

2. **Install required dependencies**:
```
conda env create -f environment.yaml
conda activate almost-a-cms
```
If you don’t have conda, you can install manually:
```
pip install flask jinja2
```

3. **Review the folder structure** to understand where templates and data files reside.

## Usage

There are two primary ways to edit the website content:

1. Command-Line Generation:

    Edit the JSON files in data/. For example, open data/about.json and change the "name" or "description" field.
    Run the generator script:
    ```
    python index_html_generator.py
    ```
    This command regenerates index.html with your updated content.
    Push your changes (including the new index.html) to GitHub to publish or update your GitHub Pages site.

2. Flask Backend:

    1. Run the Flask server:
    ```
    python app.py
    ```
    2. Open your browser at http://127.0.0.1:5000.
    3. Navigate to the editing interface (e.g., click on a section or go to /edit/<filename>) to view and modify your JSON content in a simple text box.
    4. Save changes in the interface. Behind the scenes:
    - The JSON file is updated.
    - index_html_generator.py is automatically triggered to regenerate index.html.
    5. Verify your site by refreshing your local preview or your GitHub Pages site (after committing and pushing changes).

## Project Structure
```
.
├── data/
│   ├── about.json
│   ├── blog.json
│   ├── contact.json
│   ├── portfolio.json
│   ├── resume.json
│   ├── navbar.json
│   └── sidebar.json
├── templates/
│   └── template_index.html      # Jinja2 template used to generate index.html
├── index_html_generator.py      # Script to generate index.html from the JSON files
├── app.py                       # Flask backend for editing JSON data
├── environment.yaml             # (Optional) Python dependencies
└── README.md                    # This file
```
- data/ contains the JSON files for each site section.
- template_index.html is the Jinja2 template for the final website.
- index_html_generator.py merges data/ JSON content with template_index.html.
- app.py provides a minimal Flask app to edit JSON files through a local web interface.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the Issues page to report a bug or request a feature.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/someFeature`)
3. Commit your Changes (`git commit -m 'Add some feature'`)
4. Push to the Branch (`git push origin feature/someFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. You’re free to use, modify, and distribute it as needed.

Thank you for checking out the project. Feel free to open an issue or pull request if you have any improvements or feedback!
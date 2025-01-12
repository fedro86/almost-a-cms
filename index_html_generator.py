import json
from jinja2 import Environment, FileSystemLoader
import os

def load_json(filename):
    with open(f'data/{filename}.json', 'r') as f:
        return json.load(f)

def generate_html():
    # Load all JSON data
    data = {
        'about': load_json('about'),
        'blog': load_json('blog'),
        'contact': load_json('contact'),
        'portfolio': load_json('portfolio'),
        'resume': load_json('resume'),
        'navbar': load_json('navbar'),
        'sidebar': load_json('sidebar')
    }
    
    # Setup Jinja2 environment with correct path
    env = Environment(loader=FileSystemLoader(os.path.dirname(os.path.abspath(__file__))))
    template = env.get_template('template_index.html')
    
    # Render template with data
    output = template.render(**data)
    
    # Write output to index.html
    with open('index.html', 'w') as f:
        f.write(output)

if __name__ == "__main__":
    generate_html()
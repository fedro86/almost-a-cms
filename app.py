from flask import Flask, render_template, request, jsonify
import json
import os
from index_html_generator import generate_html

app = Flask(__name__)

DATA_FOLDER = 'data'

def load_json_file(filename):
    with open(os.path.join(DATA_FOLDER, f'{filename}.json'), 'r') as f:
        return json.load(f)

def save_json_file(filename, data):
    with open(os.path.join(DATA_FOLDER, f'{filename}.json'), 'w') as f:
        json.dump(data, f, indent=4)

@app.route('/')
def index():
    return render_template('backend_index.html')

@app.route('/edit/<filename>', methods=['GET', 'POST'])
def edit(filename):
    if request.method == 'POST':
        try:
            # 1. Save JSON
            data = request.json
            save_json_file(filename, data)
            
            # 2. Regenerate index.html
            generate_html()
            
            return jsonify({
                'status': 'success',
                'message': 'File saved and index.html regenerated'
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': str(e)
            }), 500
    else:
        data = load_json_file(filename)
        return render_template('edit.html', filename=filename, data=json.dumps(data, indent=4))

if __name__ == '__main__':
    app.run(debug=True)
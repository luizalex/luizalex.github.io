from flask import Flask, request, send_from_directory
# set the project root directory as the static folder, you can set others.
app = Flask(__name__,
            static_url_path='', 
            static_folder='',
            template_folder='')
#@app.route("/")
#def hello():
#   return "Hello World!"

@app.route('/')
def root():
    return app.send_static_file('index.html')

if __name__ == "__main__":
    app.run(ssl_context='adhoc',host = '0.0.0.0',port=443)
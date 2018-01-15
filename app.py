# -*- coding: utf-8 -*-
import flask
import psycopg2 as db
import json

app = flask.Flask(__name__)
app.debug = True

# Connect to PostGIS database
conn = db.connect("dbname='mob_dev' user='nvallott' host='localhost' password=''")

@app.route('/')
def index():
    return flask.send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run()

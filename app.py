# -*- coding: utf-8 -*-
import flask
import psycopg2 as db
import json

app = flask.Flask(__name__)
app.debug = True

# Connect to PostGIS database
conn = db.connect("dbname='mobvd' user='nvallott' host='localhost' password=''")

# Creates route to polygon layer
# @app.route('/geom')
# def geom(epsg=4326):
#     return flask.jsonify({ "pixel": do_pixel(epsg), "stop": do_stop(epsg) })

@app.route('/stops')
def stops(epsg=4326):
    return json.dumps(do_stops(epsg))

def do_stops(epsg=4326):
    cur = conn.cursor() # get a query cursor
    # SQL query:
    sql = """SELECT stop_id AS stop_id, stop_name AS stop_name, ST_AsGeoJson(ST_Transform(geom, %i), 7) AS geom
             FROM vd_stops""" % epsg # FROM vd_s pour des stops 500*500
    cur.execute(sql)
    # retrieve the query result
    rows = cur.fetchall()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "stop_id": row[0],
                "stop_name": row[1]
            },
            "geometry": json.loads(row[2])
        })
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    return feature_collection

@app.route('/pix')
def pix(epsg=4326):
    return json.dumps(do_pix(epsg))

def do_pix(epsg=4326):
    cur = conn.cursor() # get a query cursor
    # SQL query:
    sql = """SELECT rastid AS rastid, ST_AsGeoJson(ST_Transform(geom, %i), 7) AS geom
             FROM pixels_rast""" % epsg
    cur.execute(sql)
    # retrieve the query result
    rows = cur.fetchall()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "rastid": row[0]
            },
            "geometry": json.loads(row[1])
        })
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    return feature_collection

@app.route('/')
def index():
    return flask.send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run()

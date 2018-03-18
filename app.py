# -*- coding: utf-8 -*-
import flask
import psycopg2 as db
import json

app = flask.Flask(__name__)
app.debug = True

# Connect to PostGIS database
conn = db.connect("dbname='mobvd' user='nvallott' host='localhost' password=''")
conn2 = db.connect("dbname='mob_dev' user='nvallott' host='localhost' password=''")
# Creates route to polygon layer
# @app.route('/geom')
# def geom(epsg=4326):
#     return flask.jsonify({ "pixel": do_pixel(epsg), "stop": do_stop(epsg) })

# Creating route for each indicator according to domain/theme value
@app.route('/s<string:s><int:i>')
def sb_tim(s, i):
    cur = conn2.cursor()     # get a query cursor
    # our SQL query:
    sql = """SELECT id AS id, orig AS orig, dest AS dest, time AS time
             FROM s%s%i""" % (s,i)

    try:
        cur.execute(sql)
        rows = cur.fetchall()

        features = []
        for row in rows:
            features.append({
                    "id": row[0],
                    "orig": row[1],
                    "dest": row[2],
                    "time": row[3]
            })

        return json.dumps(features)
    except db.Error:
        conn2.rollback()

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
    sql = """SELECT rastid AS rastid, sum AS sum, ST_AsGeoJson(ST_Transform(geom, %i), 7) AS geom
             FROM pixels_pop2""" % epsg
    cur.execute(sql)
    # retrieve the query result
    rows = cur.fetchall()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "rastid": row[0],
                "sum": row[1]

            },
            "geometry": json.loads(row[2])
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

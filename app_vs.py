# -*- coding: utf-8 -*-
import flask
import psycopg2 as db
import json

app = flask.Flask(__name__)
app.debug = True

# Connect to PostGIS database
# NB : change this part according to local database and username
# conn = db.connect("dbname='statlas' user='nvallott' host='localhost' password=''")
conn = db.connect("dbname='statlas' user='Roubak' host='localhost' password=''")

# Creating route
@app.route('/dt')
def dt():
    cur = conn.cursor()

    sql_dt = """SELECT domain AS domain, themes AS themes
            FROM domains_themes"""

    cur.execute(sql_dt)
    rows = cur.fetchall()

    domain = []
    for row in rows:
        domain.append({
            "name" : row[0],
            "themes" : row[1]
        })

    domain_collection = {
        "domains": domain
    }

    return json.dumps(domain_collection)

# Creates route to polygon layer
@app.route('/geom')
def geom(epsg=4326):
    return flask.jsonify({ "com": do_com(epsg), "cent": do_cent(epsg) })

# NEW version of polygon layer
@app.route('/com')
def com(epsg=4326):
    return json.dumps(do_com(epsg))

def do_com(epsg=4326):
    cur = conn.cursor() # get a query cursor
    # our SQL query:
    sql = """SELECT gmde AS fid, name AS com, ST_AsGeoJson(ST_Transform(geom, %i), 7) AS geom
             FROM vs_id12""" % epsg
    cur.execute(sql)
    # retrieve the query result
    rows = cur.fetchall()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "geoid": row[0],
                "nom": row[1]
            },
            "geometry": json.loads(row[2])
        })
    feature_collection = {
        "type": "FeatureCollection",
        "features": features
    }
    return feature_collection

# Creates a route for centroids of the polygons
@app.route('/cent')
def cent(epsg=4326):
    return json.dumps(do_cent(epsg))

# NEW version of centroids
def do_cent(epsg=4326):
    cur = conn.cursor() # get a query cursor
    # our SQL query:
    sql = """SELECT gmde AS fid, name AS com, ST_AsGeoJson(ST_Transform(ST_Centroid(ST_PointOnSurface(geom)), %i), 7) AS geom
             FROM vs_id12""" % epsg
    cur.execute(sql)
    # retrieve the query result
    rows = cur.fetchall()

    features = []
    for row in rows:
        features.append({
            "type": "Feature",
            "properties": {
                "geoid": row[0],
                "nom": row[1]
            },
            "geometry": json.loads(row[2])
        })
    feature_collection_cent = {
        "type": "FeautureCollection",
        "features": features
    }
    return feature_collection_cent

# Creating route for each indicator according to domain/theme value
@app.route('/d<int:i>t<int:j>')
def com_d1(i,j):
    cur = conn.cursor()     # get a query cursor
    # our SQL query:
    sql_d1 = """SELECT codgeo AS geoid, libgeo AS libgeo, d%it%i AS value
             FROM vs_fin""" %(i,j)

    cur.execute(sql_d1)
    rows = cur.fetchall()

    features_d1 = []
    for row in rows:
        features_d1.append({
                "geoid": row[0],
                "libgeo": row[1],
                "value": row[2]
        })

    return json.dumps(features_d1)

# Creating route for data about representation (map and graphic) of the data
@app.route('/style')
def com_style():
    cur = conn.cursor()     # get a query cursor
    # our SQL query:
    sql_style = """SELECT indic AS indic, mapTitle AS mapTitle, graphTitle AS graphTitle,
                label_tooltip AS labelTooltip, color AS color, lib_indic AS lib,
                mapStyle AS mapStyle, mapRelCol AS mapRelCol, mapRelSize AS mapRelSize,
                graphStyle AS graphStyle, scatRelY AS scatRelY, scatRelSize AS scatRelSize,
                scatRelCol AS scatRelCol
                FROM indic_style"""
    #Sql query style
    cur.execute(sql_style)
    rows = cur.fetchall()

    features_style = []

    for row in rows:
        features_style.append({
                "indic": row[0],
                "mapTitle": row[1],
                "graphTitle": row[2],
                "labelTooltip": row[3],
                "color": row[4],
                "lib": row[5],
                "mapStyle": row[6],
                "mapRelCol": row[7],
                "mapRelSize": row[8],
                "graphStyle": row[9],
                "scatRelY" : row[10],
                "scatRelSize": row[11],
                "scatRelCol": row[12]
        })

    return json.dumps(features_style)

@app.route('/')
def index():
    return flask.send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run()

# -*- coding: utf-8 -*-
import flask
import psycopg2 as db
import json

app = flask.Flask(__name__)
app.debug = True

# Connect to PostGIS database
conn = db.connect("dbname='mob_dev' user='nvallott' host='localhost' password=''")
#
# # Creates route to polygon layer
# @app.route('/geom')
# def geom(epsg=4326):
#     return flask.jsonify({ "pixel": do_pixel(epsg), "poly": do_poly(epsg) })
#
# @app.route('/pixel')
# def com(epsg=4326):
#     return json.dumps(do_pixel(epsg))
#
# def do_pixel(epsg=4326):
#     ###### CHANGE after that sql query to load pixel json
#
#     # cur = conn.cursor() # get a query cursor
#     # # our SQL query:
#     # sql = """SELECT gmde AS fid, name AS com, ST_AsGeoJson(ST_Transform(geom, %i), 7) AS geom
#     #          FROM vs_id12""" % epsg
#     # cur.execute(sql)
#     # # retrieve the query result
#     # rows = cur.fetchall()
#     #
#     # features = []
#     # for row in rows:
#     #     features.append({
#     #         "type": "Feature",
#     #         "properties": {
#     #             "geoid": row[0],
#     #             "nom": row[1]
#     #         },
#     #         "geometry": json.loads(row[2])
#     #     })
#     # feature_collection = {
#     #     "type": "FeatureCollection",
#     #     "features": features
#     # }
#     # return feature_collection


@app.route('/')
def index():
    return flask.send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run()

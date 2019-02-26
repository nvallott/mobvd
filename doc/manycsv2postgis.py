#!/usr/bin/env python
# -*- coding: utf-8 -*-
# for adding many csv to psql

# launch the script in 2 blocs
######## 1st bloc
import psycopg2
from os import listdir
from os.path import isfile, join

# get all the files in the path
mypath  = "/Users/nvallott/switchdrive/data/c_sd_t0"
onlyfiles = [f for f in listdir(mypath) if not f.startswith('.') and isfile(join(mypath, f))]
# Don't forget to create the database first !
conn = psycopg2.connect("dbname=mobt user=nvallott")
cur = conn.cursor()

########## 2nd bloc
# For each unique onlyfiles
for key in onlyfiles:
    dt_name = key.split('.')[0] # avoid .csv
    sql_create = """CREATE TABLE sd_t%s (id serial PRIMARY KEY, orig integer, dest integer, temps integer);""" % dt_name
    cur.execute(sql_create)
    print dt_name
conn.commit()
cur.close()
conn.close()
# 3rd bloc
    #print dt_name### Don't use reserved word like "time"
conn = psycopg2.connect("dbname=mobt user=nvallott")
cur = conn.cursor()
for key in onlyfiles:
    dt_name = key.split('.')[0]
    sql_copy = """COPY sd_t%s (orig, dest, temps) FROM '%s/%s.csv' DELIMITER ',' CSV HEADER;""" % (dt_name, mypath, dt_name)
    cur.execute(sql_copy)
    print dt_name
# commit to save and close the connection
conn.commit()
cur.close()
conn.close()

## WARNIN .DS_STORE

###################
# drop the tables
for key in onlyfiles:
    dt_name = key.split('.')[0] # avoid .csv
    sql_drop = """DROP TABLE IF EXISTS sd_t%s""" % dt_name
    lock_query = """SELECT pg_advisory_xact_lock(1)"""
    cur.execute(sql_drop)
    print dt_name
conn.commit()
cur.close()
conn.close()


# if error to close the connection
sql_error = """rollback;"""
cur.execute(sql_error)

## Search the first SElECT line
cur.execute("""SELECT * FROM sd_b9914;""")
cur.fetchall()

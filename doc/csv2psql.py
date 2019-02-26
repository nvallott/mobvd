# To import csv files to psql
# use python2 to launch the script
# pip2 install pandas
# pip2 install sqlalchemy
import pandas as pd
df = pd.read_csv('c_sd_tp.csv')
df.columns = [c.lower() for c in df.columns] #postgres doesn't like capitals or spaces

from sqlalchemy import create_engine
engine = create_engine('postgresql://nvallott:pear0@localhost:5432/mob_sum')

df.to_sql("c_sd_tp", engine)


#Set is so the raw sql output is logged
# import logging
# logging.basicConfig()
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# df.to_sql("my_table_name2",
#           engine,
#           if_exists="append",  #options are ‘fail’, ‘replace’, ‘append’, default ‘fail’
#           index=False, #Do not output the index of the dataframe
#           dtype={'col1': sqlalchemy.types.NUMERIC,
#                  'col2': sqlalchemy.types.String}) #Datatypes should be [sqlalchemy types][1]

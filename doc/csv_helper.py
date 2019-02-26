# csv_helper
# de préférence lancer avec ipython v3!
# pour diviser sur python 2 > x / float(y) sinon int
import csv as csv
with open("c_test.csv") as fin:
    fin.next()
    total = sum(int(r[1]) for r in csv.reader(fin))

# count lines
row_count = sum(1 for line in open("c_test.csv"))

# concatenate columns
import pandas as pd
l = pd.read_csv('c_sd_tp.csv')
l['merge'] = l['orig'].map(str) + l['dest'].map(str)
l.to_csv('m_sd_tp.csv', header = True)

k = pd.read_csv('c_sd_tp7h15.csv')
k['merge'] = k['orig'].map(str) + k['dest'].map(str)
k.to_csv('m_sd_tp7h15.csv', header = True)

# third file
g  = pd.read_csv('c_sd_tp7h30.csv')
g['merge'] = g['orig'].map(str) + g['dest'].map(str)
g.to_csv('m_sd_tp7h30.csv', header = True)

# 4th file
f  = pd.read_csv('c_sd_tp7h45.csv')
f['merge'] = f['orig'].map(str) + f['dest'].map(str)
f.to_csv('m_sd_tp7h45.csv', header = True)

# merge 2 csv
c = pd.read_csv("m_sd_tp.csv", index_col=0)
d = pd.read_csv("m_sd_tp7h15.csv", index_col=0)
# d = d.dropna(axis=1)
m1 = c.merge(d, on='merge', how='outer')
# m.to_csv("output.csv", index=False)
# add data to the m1 df
e = pd.read_csv("m_sd_tp7h30.csv", index_col=0)
m1 = m1.merge(e, on='merge', how='outer')
# add data to the m1 df
h = pd.read_csv("m_sd_tp7h45.csv", index_col=0)
m1 = m1.merge(h, on='merge', how='outer')

# merge columns after outer merge
m1['orig_z'] = m1['orig_x'].where(m1['orig_x'].notnull(), m1['orig_y'])
m1['dest_z'] = m1['dest_x'].where(m1['dest_x'].notnull(), m1['dest_y'])

m1['orig_z2'] = m1['orig'].where(m1['orig'].notnull(), m1['orig_z'])
m1['dest_z2'] = m1['dest'].where(m1['dest'].notnull(), m1['dest_z'])

m1['orig_z3'] = m1['orig'].where(m1['orig'].notnull(), m1['orig_z2'])
m1['dest_z3'] = m1['dest'].where(m1['dest'].notnull(), m1['dest_z2'])

# delete row, 1 is for axis column
m1 = m1.drop('orig', 1)
m1= m1.drop('dest', 1)
# OR
m1 = m1.drop(m1.columns[[4, 5, 6, 7]], axis=1)
# change column name
m1 = m1.rename(columns={'orig_z3': 'orig'})
m1.columns.values[0] = 't00'

# found the min time by row
m1['mintime'] = m1.loc[:, ['t00','t15','t30','t45']].min(axis=1)

# keep only columns
m3 = m3[['orig', 'dest', 'mintime']]
# sum min max of the groupby
sum = m.groupby('orig_x', as_index=False).sum()
mean = m.groupby('orig', as_index=False).mean()
min = m2.groupby('orig', as_index=False).min()

# indexes
m['ind'] = m['temps_x']/m['temps_y']
mean['ind2'] = mean['temps_x']/mean['temps_y']
mean = mean.drop('ind2', 1)

# without decimals
m3.astype(int)
# save the files
mean.to_csv('mean_tpmin.csv', header = True, index=False)

#######
# many files to one csv
import glob
import pandas as pd

path =r'/Users/nvallott/switchdrive/data/c_sd_c' # use your path
allFiles = glob.glob(path + "/*.csv")
frame = pd.DataFrame()
list_ = []
for file_ in allFiles:
    df = pd.read_csv(file_,index_col=None, header=0)
    list_.append(df)
frame = pd.concat(list_)

frame['t00'] = frame['temps'].where(frame['temps'].notnull(), frame['time'])
frame = frame[['orig', 'dest', 't00']]
frame = frame.astype(int)
frame = frame.rename(columns={'t00': 'timec'})
frame = frame.sort_values(['orig','dest'], ascending=[True,True])
frame.to_csv('c_sd_call.csv', header = True, index=False)

#####
tp = pd.read_csv('c_sd_tpmin.csv')
tc = pd.read_csv('c_sd_call.csv')

tp['merge'] = tp['orig'].map(str) + tp['dest'].map(str)
tc['merge'] = tc['orig'].map(str) + tc['dest'].map(str)

t1 = tp.merge(tc, on='merge', how='outer')

t1['orig_z'] =/Users/nvallott/script/manycsv2postgis.py t1['orig_x'].where(t1['orig_x'].notnull(), t1['orig_y'])
t1['dest_z'] = t1['dest_x'].where(t1['dest_x'].notnull(), t1['dest_y'])

t1 = t1.drop(t1.columns[[0, 1, 4, 5]], axis=1)
t1 = t1.fillna(0)
t1[['orig', 'dest']] =t1[['orig', 'dest']].astype(int)
t1 = t1.rename(columns={'orig_z': 'orig'})
t1 = t1.rename(columns={'dest_z': 'dest'})

t1 = t1[['orig', 'dest', 'mintime', 'timec']]
t1 = t1.sort_values(['orig','dest'], ascending=[True,True])

t1['ind'] = t1['timec']/t1['mintime']

t1.to_csv('a_index.csv', header = True, index=False)

########

tmean = t1.groupby('orig', as_index=False).mean()
tmean.to_csv('a_mean_index.csv', header = True, index=False)

### pondération
tpop = pd.read_csv('pop7_vd.csv')
tpop = tpop.drop('geom', 1)

tpop = tpop.rename(columns={'merge': 'orig'})
tpop = tpop.merge(tmean, on='orig', how='outer')

tpop.to_csv('tpop.csv', header = True, index=False)

tmean = pd.read_csv('a_mean_index.csv')
tpop = pd.read_csv('tpop.csv') # tmean avec la pop


with open("tpop.csv") as fin:
    fin.next()
    total = sum(int(r[1]) for r in csv.reader(fin))
p = 1357013
n = 4757
# 1/(4757*1357013) *

tpop['ind_pond'] = n1 * (tpop['timec']/tpop['mintime']) * (tpop['sum']/1357013)# * (tpop['sum'])
tpop['ind_pond2'] = (tpop['timec']/tpop['mintime']) * (tpop['sum']/1357013)


############
# faire un log
import numpy as np
np.log(tpop['ind_pond'])

tpop['i2log'] = (np.log(tpop['timec'])/np.log(tpop['mintime'])) * (tpop['sum']/1357013)
tpop['iplog2'] = (tpop['timec']/tpop['mintime']) * (np.log(tpop['sum']/1357013))

tpop.to_csv('pondt.csv', header = True, index=False)

# il faut pondérer sur les valeurs de destinations AVANT de faire la somme
df = pd.read_csv('a_index.csv')
tpop = pd.read_csv('pop7_vd.csv')
tpop = tpop.drop('geom', 1)

td = df.merge(tpop, on='dest', how='outer')
td = td.sort_values(['orig','dest'], ascending=[True,True])
td = td.drop([22434027,22434026, 22434025, 22434025,22434024])
td[['orig', 'mintime','timec']] =td[['orig', 'mintime','timec']].astype(int)

td['indp'] = td['ind'] * (td['sum']/1357013)
tpond = td.groupby('orig', as_index=False).sum()

sumtpond = tpond['orig'].sum()

tpon.to_csv('pondt.csv', header = True, index=False)
tpon = tpon.drop(tpon.columns[[0, 1, 2, 3,4,5]], axis=1)
tp.to_csv('tpond.csv', header = True, index=False)

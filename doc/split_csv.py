# A simple program to cut a file with numpy
import pandas as pd

df = pd.read_csv('SB_tim_otp.csv')
df = df.sort_values('dest')  # Sorting isn't needed
for key in df['orig'].unique():  # For each value in Column1
    # These two steps can be combined into a single call
    # I'll separate for clarity:
    # 1) filter the dataframe on the unique value
    dw = df[df['orig']==key]
    dw.drop(dw.columns[[0]], axis=1)
    # 2) write the resulting dataframe with headers
    dw.to_csv("SB_tim_otp/%s.csv" % key, header=True)

# # lire le csv
# df, data = pd.read_csv('file.csv')
# # afficher le nombre de valeur par orig
# data['orig'].value_counts()
#
# # afficher la liste des orig
# data.groupby(['orig']).groups.keys()
#
# # afficher sommes des temps par orig
# data.groupby('orig')['temps'].sum()
#
# # afficher le count par orig
# data.groupby('orig')['temps'].count()

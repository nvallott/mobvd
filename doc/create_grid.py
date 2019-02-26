## Create grid avec coordonnées suisses

# coordonnees du point en bas à droite


#for (x=xmin; x <= xmax; x+=res)
# { for (y=ymin; y <= ymax; y += res) { console.log(x,y); } }
xmin = 488650
ymin = 108950
xmax = 588150
ymax = 204450
res = 500
x = xmin-res
y = ymin-res
while x <= xmax-res:
    x+=res
    while y <= ymax-res:
        y+=res
        print(x,y)
    y = ymin-res


row = "\t"
bak = ","
for r in res:
    print(res)
    #for res in range(xmin-xmax):
        #grid.append(xmin-xmax+res)

####################################

setwd("/Users/nvallott/switchdrive/shape")
Q = data.frame(read.csv("a_ogr_test.csv",header=F,sep=","))
Q[4] = NULL
Q
Q2 = Q
Q2

nr = nrow(Q)
nr
k = 1
  for(i in 1:nrow(Q)){
    for(k in 0:(nrow(Q)-1)){
      Q2[i+(nr*k),1] = Q[i,1]
      Q2[i+(nr*k),2] = Q[i,2]
      Q2[i+(nr*k),3] = Q[i,3]
      Q2[i+(nr*k),4] = Q[k+1,2]
      Q2[i+(nr*k),5] = Q[k+1,3]
    }
  }
for(i in 1:(nrow(Q)^2)){
  Q2[i,1] = i
}

write.table(Q,"ar_test2.csv",sep=",",quote=F,row.names = F,)

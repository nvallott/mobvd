---------------------------------------
-- mobvd script sql on psql and postgis
-- Nicolas Vallotton 2017-2018
-- version de pgsql
SELECT version();
-- Créer extension postgis
CREATE EXTENSION postgis;
-- version de postgis
SELECT postgis_full_version();
-- mettre à jour l'extension postgis
ALTER EXTENSION postgis UPDATE TO "2.4.4";
-- activer gdal
SET postgis.gdal_enabled_drivers = 'ENABLE_ALL';

----------------------------------
alter table stops add geom geometry;

update stops set geom = ST_GeometryFromText('POINT(' || stop_lon || ' ' || stop_lat || ')', 4326) ;
select * from stops;

select 'POLYGON((' || st_x(st_transform(geom, 21781))-250 || ' ' || st_y(geom)-250 from stops limit 10;

create table pixels_tp as
select stop_id, stop_name, ST_GeometryFromText('POLYGON((' || x-250 || ' ' || y-250 || ',' || x+250 || ' ' || y-250 || ',' || x+250 || ' ' || y+250 || ',' || x-250 || ' ' || y+250 || ',' || x-250 || ' ' || y-250 || '))', 21781) AS geom  from
(select stop_id, stop_name, st_x(st_transform(geom, 21781)) as x, st_y(st_transform(geom, 21781)) as y from stops) A;

select * from vd_rast;
select * from vd_pix;
create table vd_pix as
select rastid, ST_GeometryFromText('POLYGON((' || x-250 || ' ' || y-250 || ',' || x+250 || ' ' || y-250 || ',' || x+250 || ' ' || y+250 || ',' || x-250 || ' ' || y+250 || ',' || x-250 || ' ' || y-250 || '))', 21781) AS geom from
(select rastid, st_x(st_transform(geom, 21781)) as x, st_y(st_transform(geom, 21781)) as y from vd_rast) A;

create table stop_buff as
select stop_id, stop_name, ST_Buffer(st_transform(geom, 21781), 100) as geom from stops;

select * from stop_buff limit 10;

select * from
pixels_carres P join (select ST_GeometryFromText('POINT(600000 200000)', 21781) AS pt) A
ON ST_Intersects(P.geom, A.pt);


select * from stop_buff;
select * from vd_2000;
select * from pixels_carres;
select * from stops_vd100;
select * from stops;

-- pour trouver les grandes gares selon nombre de quais
create table stops_platform as
select stop_id, stop_name, stop_lat, stop_lon, parent_sta, st_transform(P.geom, 21781) as geom
from stops P, vd_2000 V
where ST_Within(st_transform(P.geom, 21781), V.geom);


-- autre méthode pour les counts (perte de l'info des lat lon et id)
create table plat7 as
SELECT stop_name, COUNT(stop_name) AS platforms
FROM stops_platform
GROUP BY stop_name
HAVING COUNT(stop_name) > 6;

create table stops_platform2 as
select * from stops_platform;
alter table stops_platform2 add column count integer;

select * from stops_platform2;


select * from stops_platform where stop_id like '%0:%';
create table plat2 as
select * from stops_platform where stop_id like '%0:2';
create table plat31 as
select * from stops_platform where stop_id like '%0:3';

alter table plat3 drop column stop_name;

-- export des gares qui ont plus de 3 quais
COPY plat3 to '/Users/nvallott/Dropbox/AAGSE/AMémoire/data/plat3.csv' DELIMITER ',' CSV HEADER;

create table stops_vd100 as
select stop_id, stop_name, P.geom
from stop_buff P, vd_2000 V
where ST_Within(P.geom, V.geom);

select P.geom, stop_id
from pixels_carres P, vd_2000 V
where ST_Within(P.geom, V.geom);

create table stops_vd as;

select stop_id, stop_name, P.geom
from stops P, vd_2000 V
where ST_DWithin(P.geom, V.geom);

select * from vd_stops;

select * from vd_stops where stop_id like '%P';

create table stops1 as
select * from stops where parent_station = '';
select * from stops1;

select * from stops1 where stop_name like 'Lausanne%';

select * from stops_vd100;
delete from stops_vd100 where stop_id like '%0:%';
delete from stops_vd100 where stop_id like '%P';

  
select * from vd_stops;

select S.geom, stop_id, stop_name
from vd_stops S, vd_2000 V
where ST_Within(S.geom, V.geom);

alter table vd_rast rename v1 TO rastid;

select * from pixels_rast;

create table pixels_rast as
select rastid, ST_GeometryFromText('POLYGON((' || x-250 || ' ' || y-250 || ',' || x+250 || ' ' || y-250 || ',' || x+250 || ' ' || y+250 || ',' || x-250 || ' ' || y+250 || ',' || x-250 || ' ' || y-250 || '))', 21781) AS geom  from
(select rastid, st_x(st_transform(geom, 21781)) as x, st_y(st_transform(geom, 21781)) as y from vd_rast) A;

select * from
pixels_rast A join pixels_tp P
ON ST_Intersects(A.geom, P.geom);

select * from stops_vd100;

-- la requete pour trouver le plus proche arret de chaque pixel et sa distance s'il se trouve plus loin
create table nea_stopCH as
SELECT DISTINCT ON (R.rastid) R.rastid, T.stop_id, T.stop_name, T.stop_lat, T.stop_lon, ST_Distance(R.geom, T.geom) as dist
FROM pixels_rast As R, vd_chpoint As T
ORDER BY R.rastid, ST_Distance(R.geom, T.geom), T.stop_id;


select * from nearest_stop;
select * from nearest_stop2;
select * from nearest_stop3;
select * from nearest_stop4;
-- arrêt en point qui intersectionne ou le plus proche du pixel avec lat lon
select * from nea_stopCH;
select * from pixels_rast;
select * from vd_stops;
select * from vd_s;
select * from stops_vd100;
select * from nearest_ni;

-- intersection pixels pop > pixels arrêts   
create table nearest_stop2 as
select P.rastid, S.stop_id, stop_name from
pixels_rast P join vd_stops S
ON ST_Intersects(P.geom, S.geom);

-- intersection pixels pop > points arrêts !!!!!!!!!!!!!!!!!!! avec coor WGS
create table nearest_stop5 as
select P.rastid, S.stop_id, stop_name, stop_lat, stop_lon from
pixels_rast P join vd_chpoint S
ON ST_Intersects(P.geom, S.geom);



-- juste pour faire l'export et virer les colonnes en trop (vu que j'ai viré rastid, on ne sait plus de quel pixel on parle donc il faudra faire une jointure avec les temps depuis nearest_stop5 >>> meilleure )
create table nearest_stop6 as;
select * from nearest_stop6; 
alter table nearest_stop6 drop column rastid;

-- donc ça je vais utiliser pour faire trouver quel est le meilleur arrêt par pixel, avec la meilleur accessibilité
COPY nearest_stop6 to '/Users/nvallott/Dropbox/AAGSE/AMémoire/data/best_stop.csv' DELIMITER ',' CSV HEADER;

create table nearest_stop4 as
select P.rastid, S.stop_id, stop_name, ST_Distance(P.geom, S.geom) from
pixels_rast P join stops_vd100 S
ON ST_Intersects(P.geom, S.geom);

-- table arrêts les plus proches sans les intersections !!!!!!
create table nea_stopCH_dist as
select * from nea_stopCH
where dist <> 0;

-- donc ça c'est la table que je vas utiliser pour les arrêts qui intersectionnent pas !!!!
select * from nea_stopCH_dist;

create table nearest_stops as
select * from nearest_test order by rastid;
select * from nearest_stops;

-- Union de deux tables
create table nearest_test as
select * from nearest_ni
union
select * from nearest_stop3;

create table nearest_short as ;
select * from nearest_stops;

alter table nearest_short drop column stop_name;
select * from nearest_short;

select * from vd_s where stop_id = '8500730';
select * from vd_s where stop_id = '8500736';

select * from nearest_stops;

select * from vd_s;
select * from vd_s where stop_name = 'Renens';
select * from vd_s where stop_name like '%Nyon%';
select * from vd_s where stop_name like '%Lausanne';
create table vd_s2 as;
select stop_id, stop_lat, stop_lon from new_stops;

delete from new_stops where stop_id like '%0:%';
delete from new_stops where stop_id like '%P';

--
COPY vd_s2 to '/Users/nvallott/Dropbox/AAGSE/AMémoire/data/tp_coor.csv' DELIMITER ',' CSV HEADER;

COPY tp_coor (stop_id, stop_lat, stop_lon) FROM '/Users/nvallott/Dropbox/AAGSE/AMémoire/data/tp_coor.csv' DELIMITER ',' CSV HEADER;
-- Request in the flask app (change the EPSG for i%)
SELECT stop_id AS stop_id, stop_name AS stop_name, ST_AsGeoJson(ST_Transform(geom, 4326), 7) AS geom FROM vd_stops;

select * from vd_s;
--Faire une geometrie à partir d'un champ ou de deux champs
alter table vd_s add geom geometry;
update vd_s set geom = ST_GeometryFromText('POINT(' || stop_lon || ' ' || stop_lat || ')', 4326) ;

-- duplique la table
create table vd_CHpoint as;
select * from vd_s;
-- supprimer une colonne
alter table vd_chpoint drop column geom2;
-- ajout d'une colonne
alter table vd_CHpoint add geom2 geometry;
-- remplir une colonne
update vd_CHpoint set geom2 = ST_Transform(geom, 21781);
-- supprimer colonne 
alter table vd_chpoint drop column gid;
-- changer nom de la colonne
alter table vd_chpoint rename geom2 TO geom;

-- afficher la table
select * from vd_CHpoint;

-- Request in the flask app (change the EPSG for i%)
SELECT stop_id AS stop_id, stop_name AS stop_name, ST_AsGeoJson(ST_Transform(geom, 4326), 7) AS geom FROM vd_s;

select * from vd_pixels;
SELECT v1 AS rastid, ST_AsGeoJson(ST_Transform(geom, 4326), 7) AS geom FROM vd_pixels;

SELECT rastid AS rastid, ST_AsGeoJson(ST_Transform(geom, 4326), 7) AS geom
             FROM vd_psquare;
             
SELECT stop_id AS stop_id, stop_name AS stop_name, ST_AsGeoJson(ST_Transform(geom, 4326), 7) AS geom
             FROM vd_stops;
             
--request de la muerte
-- pour trouver la somme de la population pour chaque pixel 
 
create table count_pop AS
 SELECT vd_psquare.rastid, sum(vd_pop.b15btot) 
 FROM vd_psquare LEFT JOIN vd_pop 
 ON ST_intersects(vd_psquare.geom, vd_pop.geom) 
 GROUP BY vd_psquare.rastid;
--

select * from count_pop;
select * from vd_pop;
select * from vd_pop_test;
select * from vd_psquare;
select * from pixels_rast;
select * from pixels_pop2;
             
create table pixels_pop2 AS
 SELECT pixels_rast.rastid, COALESCE(sum(vd_pop_ch.b15btot), 0), pixels_rast.geom
 FROM pixels_rast LEFT JOIN vd_pop_ch
 ON ST_intersects(pixels_rast.geom, vd_pop_ch.geom) 
 GROUP BY pixels_rast.rastid, pixels_rast.geom;

alter table pixels_pop alter column sum as
SELECT COALESCE(sum, 0 ) FROM pixels_pop;

alter table pixels_pop2 rename sum_pop TO sum;

select * from pixels_pop2;

-- calcul du meilleur temps pour séléctionner les meilleurs arrêts selon les 11 gares principales
select * from tp_otp;

alter table tp_otp drop column index;

-- les arrêts qui intersectionent une fois ou plusieurs fois >> jointure avec tp_opt
select * from nearest_stop5;

-- jointure entre les temps de parcours et les infos des arrêts !!! attention il faut caster en int !!!
create table best_ as
SELECT tp_otp.dest, tp_otp.orig, tp_otp.time, nearest_stop5.rastid, nearest_stop5.stop_name, nearest_stop5.stop_lat,nearest_stop5.stop_lon
    FROM tp_otp, nearest_stop5
    WHERE tp_otp.dest::int = nearest_stop5.stop_id::int;

select * from tp_best;
-- YES ! j'affiche les arrêts des pixels correpondant avec leur temps total (donc la plus petite sum donne l'arrêt le plus efficace)
create table stops_rast as
SELECT tp_best.dest,tp_best.rastid, tp_best.stop_name, tp_best.stop_lat,tp_best.stop_lon, sum(tp_best.time)
 from tp_best
 GROUP BY tp_best.dest,tp_best.rastid, tp_best.stop_name, tp_best.stop_lat,tp_best.stop_lon;

select * from stops_rast;

-- trouve l'arrêt par pixel avec le temps le plus court 
create table best_inter as;
SELECT * from stops_rast S
join (select rastid as id , min(sum) AS min_time from stops_rast
group by rastid) A
ON S.rastid = A.id and sum = A.min_time;

select * from best_inter;
alter table best_inter add column dist int;

-- Union entre mes arrêts les plus proches ou les plus efficaces (min_time) ! Ne pas oublier de caster !
create table my_stops as 
select rastid, dest::int as stop_id, stop_name, stop_lat, stop_lon, dist from best_inter
union 
select rastid, stop_id::int, stop_name, stop_lat, stop_lon, dist from nea_stopch_dist;

select * from my_stops;

-- donc ça c'est la table que je vas utiliser pour les arrêts qui intersectionnent pas !!!!
select * from nea_stopCH_dist;

create table my_stops as
 select * from nea_stopCH_dist
 union
 select * from best_inter;
 
 
 -- pour trouver l'hectare avec le max de pop pour chaque pixel 
 select * from count_pop;
 select * from vd_psquare;
 select * from vd_pop;
 
 
-- test where de raph
SELECT a.rastid, max(b.b15btot)
 FROM vd_psquare  a, vd_pop b
 WHERE ST_intersects(a.geom, b.geom) 
 GROUP BY a.rastid ;
 
 -- l'hectare et ses coordonnées avec le plus de pop
-- ca marche ! merci Raph

WITH its AS (
  SELECT vd_psquare.rastid, vd_pop.gid as ggid
  FROM vd_psquare, vd_pop
  WHERE ST_Intersects(vd_psquare.geom, vd_pop.geom)
), test AS (
  SELECT *
  FROM its a
  RIGHT JOIN vd_pop
  ON a.ggid = vd_pop.gid  
)
SELECT a.*
INTO pop_max
FROM test a, (SELECT rastid, MAX(b15btot) AS max FROM test GROUP BY (rastid)) b
WHERE a.rastid = b.rastid
  AND a.b15btot = b.max;
  
SELECT * FROM pop_max;

----------------------------------
--  Décalage de 50m 
select * from c_pop limit 10;
select * from c_emp limit 10;

-- supprimer les colonnes en trop
alter table c_emp drop column index;

-- créer la nouvelle colonne 
alter table c_pop add column x_cent bigint;
update c_pop set x_cent = x_koord + 50 ;

alter table c_pop add column y_cent bigint;
update c_pop set y_cent = y_koord + 50 ;

-- créer geometrie
alter table c_pop add geom geometry;
update c_pop set geom = ST_GeometryFromText('POINT(' || x_cent || ' ' || y_cent || ')', 21781) ;
--------------------------------
-- créer la nouvelle colonne 
alter table c_emp add column x_cent bigint;
update c_emp set x_cent = x_koord + 50 ;

alter table c_emp add column y_cent bigint;
update c_emp set y_cent = y_koord + 50 ;

-- créer geometrie
alter table c_emp add geom geometry;
update c_emp set geom = ST_GeometryFromText('POINT(' || x_cent || ' ' || y_cent || ')', 21781) ;

select * from c_pop limit 10;
select * from c_emp limit 10;

------------------------------
-- select seulement les hect du cantons + 2000 mètres pour les enclaves etc.
create table c_popvd as
select reli, x_cent, y_cent, b16btot, P.geom
from c_pop P, vd_2000 V
where ST_Within(P.geom, V.geom);

-- les b1508empt sont les emplois totaux et non en équivalent plein-temps
create table c_empvd as
select reli, x_cent, y_cent, b1508empt, P.geom
from c_emp P, vd_2000 V
where ST_Within(P.geom, V.geom);

select * from c_popvd ;
select * from c_empvd ;

-- merge les pop en emplois
-- union des pop et emp
create table c_pe as;
select * from c_popvd
union 
select * from c_empvd;

-- somme des pop et emplois par hect
create table c_pet as;
select reli, x_cent, y_cent, sum(b16btot) as pop
 from c_pe
 group by reli, x_cent, y_cent;
 
-- hect avec plus de 4 personnes
create table c_3pe as
select * from c_pet
where pop > 3;

select * from c_3pe;
select * from c_4pe;
-- créer la colonne geometrie
alter table c_3pe add column geom geometry;
update c_3pe set geom = ST_GeometryFromText('POINT(' || x_cent || ' ' || y_cent || ')', 21781) ;

create table cr_3pe as
select reli, pop, ST_GeometryFromText('POLYGON((' || x-50 || ' ' || y-50 || ',' || x+50 || ' ' || y-50 || ',' || x+50 || ' ' || y+50 || ',' || x-50 || ' ' || y+50 || ',' || x-50 || ' ' || y-50 || '))', 21781) AS geom from
(select reli, pop, st_x(st_transform(geom, 21781)) as x, st_y(st_transform(geom, 21781)) as y from c_3pe) A;

-- après avoir ajouté des données delim csv2psql
-- delim 500

select * from c_delim;
alter table c_delim add column geom geometry;
update c_delim set geom = ST_GeometryFromText('POINT(' || x || ' ' || y || ')', 21781) ;


create table c_delim_r as;
select index, ST_GeometryFromText('POLYGON((' || x-250 || ' ' || y-250 || ',' || x+250 || ' ' || y-250 || ',' || x+250 || ' ' || y+250 || ',' || x-250 || ' ' || y+250 || ',' || x-250 || ' ' || y-250 || '))', 21781) AS geom from
(select index, st_x(st_transform(geom, 21781)) as x, st_y(st_transform(geom, 21781)) as y from c_delim) A;

select * from c_delim_r;
select * from cr_3pe;

-- compte la somme de la population de chaque pixel
create table c_dpe as 
 SELECT d.index, sum(p.pop) as pop, d.geom
 FROM c_3pe p LEFT JOIN c_delim_r d
 ON ST_intersects(p.geom, d.geom) 
 GROUP BY d.index, d.geom;
 
 
-- compte le nombre d'hect par pixel
create table c_dcount as 
 SELECT d.index, count(p.reli) as pop, d.geom
 FROM c_3pe p LEFT JOIN c_dpe d
 ON ST_intersects(p.geom, d.geom) 
 GROUP BY d.index, d.geom;
 
 -- trouve l'hect le plus peuplé par pixel >> centroides de ces hectares serviront pour le routing voiture
 create table c_dmax as 
 SELECT d.index, max(p.pop) as pop, d.geom
 FROM c_3pe p LEFT JOIN c_dpe d
 ON ST_intersects(p.geom, d.geom) 
 GROUP BY d.index, d.geom;

select * from c_dcount
where pop >=2;

-- slesction des pixels avec plus 7 populations+emplois (voir fichier excel)
create table c_d7 as
select * from c_dpe
where pop >=7;
-- trouver la somme de la populations+emplois total sur tous les pixels
select sum(pop) from c_dpe;

select * from c_dmax; 
select * from c_dcount; 
select * from c_dpe;

select * from c_d7;
select * from c_3pe;
-------
select * from vd_psquare;
select * from vd_pop;

-- selection des données de l'hectares avec le max de population par pixel (parfois plusieurs hect par pix!)
WITH its AS (
  SELECT c_d7.index, c_3pe.reli as relii
  FROM c_d7, c_3pe
  WHERE ST_Intersects(c_d7.geom, c_3pe.geom)
), test AS (
  SELECT *
  FROM its a
  RIGHT JOIN c_3pe
  ON a.relii = c_3pe.reli  
)
SELECT a.*
INTO c_pmax
FROM test a, (SELECT index, MAX(pop) AS max FROM test GROUP BY (index)) b
WHERE a.index = b.index
  AND a.pop = b.max;
  
select * from c_pmax;
select * from vd_chpoint;
select * from vd_s;
select * from c_maxs;

-- selection du plus proche et distance de l'hectare le plus peuplé par pixel d'un arrêt de transport

create table c_maxs as
SELECT DISTINCT ON (R.index) R.index, R.x_cent, R.y_cent, T.stop_id, T.stop_name, ST_Distance(R.geom, T.geom) as dist, r.geom 
FROM c_pmax r, vd_chpoint t
ORDER BY R.index, ST_Distance(R.geom, T.geom), T.stop_id;

select * from c_maxs;

-- la table pour le routing, changement des coord CH1903 et WGS
alter table c_maxs add column wgs geometry;
update c_maxs set wgs = ST_GeometryFromText('POINT(' || st_x(st_transform(geom, 4326)) || ' ' || st_y(st_transform(geom, 4326)) || ')', 4326) ;
alter table c_maxs add column x_wgs float;
alter table c_maxs add column y_wgs float;
update c_maxs set x_wgs = st_x(wgs);
update c_maxs set y_wgs = st_y(wgs);

-- dump the routing table
create table c_rout as
select index as GEOID, y_wgs as Y, x_wgs as X 
from c_maxs;
select * from c_rout;
COPY c_rout to '/Users/nvallott/Desktop/c_rout.csv' DELIMITER ',' CSV HEADER;

create table sdc_fail4 as
select * from c_rout where geoid = 5810 OR geoid = 
5030 OR geoid = 
5063 OR geoid = 
6196 OR geoid = 
6213 OR geoid = 
6794 OR geoid = 
8148 OR geoid = 
6579 OR geoid = 
6596 OR geoid = 
6601 OR geoid = 
7545 OR geoid = 
7937 OR geoid = 
8329 OR geoid = 
15060 OR geoid = 
15063 OR geoid = 
17021 OR geoid = 
12170 OR geoid = 
12183 OR geoid = 
14108 OR geoid = 
14481 OR geoid = 
14871 OR geoid = 
15061 OR geoid = 
15276 OR geoid = 
15288 OR geoid = 
15862 OR geoid = 
16243 OR geoid = 
16982 OR geoid = 
17401 OR geoid = 
17620 OR geoid = 
18325 OR geoid = 
18386 OR geoid = 
18902 OR geoid = 
19149 OR geoid = 
19342 OR geoid = 
19345 OR geoid = 
19518 OR geoid = 
19735 OR geoid = 
20058 OR geoid = 
20060 OR geoid = 
20143 OR geoid = 
20250 OR geoid = 
20443 OR geoid = 
20637 OR geoid = 
20872 OR geoid = 
21064 OR geoid = 
21066 OR geoid = 
22821 OR geoid = 
31077 OR geoid = 
31644 OR geoid = 
11028 OR geoid = 
11033 OR geoid = 
11412 OR geoid = 
12192 OR geoid = 
12195 OR geoid = 
18765 OR geoid = 
19148 OR geoid = 
19566 OR geoid = 
19700 OR geoid = 
21395 OR geoid = 
21402 OR geoid = 
22171 OR geoid = 
22179 OR geoid = 
22936 OR geoid = 
23329 OR geoid = 
24846 OR geoid = 
26374 OR geoid = 
27882 OR geoid = 
27886 OR geoid = 
28266 OR geoid = 
29251 OR geoid = 
29408 OR geoid = 
31676 OR geoid = 
31914 OR geoid = 
35379 OR geoid = 
25432 OR geoid = 
33003 OR geoid = 
6021 OR geoid = 
32815 OR geoid = 
32622;

select * from sdt_fail;
COPY sdt_fail to '/Users/nvallott/Desktop/sdt_fail.csv' DELIMITER ',' CSV HEADER;
COPY sdc_fail4 to '/Users/nvallott/Desktop/sdc_fail4.csv' DELIMITER ',' CSV HEADER;
COPY c_d7 to '/Users/nvallott/switchdrive/pop7_vd.csv' DELIMITER ',' CSV HEADER;
----





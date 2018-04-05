-- MOBVD requêtes sql
-- Manipulations de données dans psql pour mobvd
-- Nicolas Vallotton 2017

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
-- pour trouver la somme de la poluation pour chaque pixel 
 
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
create table best_inter as
SELECT * from stops_rast S
join (select rastid as id , min(sum) AS min_time from stops_rast
group by rastid) A
ON S.rastid = A.id and sum = A.min_time;

select * from best_inter;
 

##### log mobvd
## Nicolas Vallotton 2018
##################
### A FAIRE


* opacity en fonction de la population ?
* remplacer vélo par une carte avec la différence temps TC/TIM
		- récréer une nouvelle table ou charger les deux lors de l'affichage ?
		- plus simple de recréer une table
* carte accessibilité globale > temps moyen en TIM/TC (indice entre 0 pour utilisation de TIM pertinente à 1 TC concurrence TIM)
	- comment ponderer avec la population ?
* trouver de la doc sur les secteurs d'accessibilité


### EN COURS

* calculer encore les derniers pixels

### A CORRIGER

* créer un graph avec le bon TLM > otp WGS.tif sur le serveur
	- tester les temps de parcours à vélo > toujours pas
				* supprimer les temps de parcours à vélo (résultats mauvais/pas assez de résultats/trop longues distances)
* les iso dans le snap
* mapbox ajout de labels à petite échelle

### FAIT!

surligner le pix sélectionné
* légende "emplois"
* les iso reapparaissent après le zoom > OK
* les tooltip pas parfait (disparition après reload)
  - dépend de quand  on lance les pixels (normalement après le premier chargement donc ok)
  - mieux
* dans raster : choix tim tp
* implémenter la BD avec
  * lier avec pop/emp > tooltip
* Postgis distance du pixel ?
* corriger la supperposition des pixels (hide au lieu de remove!)
* hide/show deco iso
* change color avec ANIMATION
* choisir otp ou flask
* boutton raster/ vecteur
* change color des pixels et stops pour ne pas recharger a chaque fois le json
* lier stop id avec les coord !!!
* implémenter la BD avec
  * tous les pixels
  * les données SA et SB
* queue
* les tooltip disparaisent lorsqu'on reload une couche par dessus
* tooltip stops
* ajout des stops dans le Layer control
* Snap, presque
* colorbrewer
* fond mapbox et toner


### IDEES

* export json
*

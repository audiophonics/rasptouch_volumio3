
*This document is also available in [English](https://github.com/audiophonics/rasptouch_volumio3/blob/main/readme.md)*

---

Depuis Volumio 3 il n'est plus aussi facile qu'auparavant d'installer ce système d'exploitation sur un Rasptouch et d'en utiliser toutes les fonctionnalités. Voici une procédure pour retrouver toutes les fonctions de l'appareil tournant sous un Volumio récent.
*(dernière mise à jour : 27/02/2023)*

---
### Prérequis

Ce tutoriel part du principe que

- Votre RaspTouch est relié à un réseau local à l'aide d'un câble réseau (RJ45).
- Vous disposez d'un PC (ou tout autre appareil) relié à ce même réseau local et disposant d'un client SSH.
- La procédure propre et recommandée par Volumio implique désormais de créer un compte myVolumio.

---

### Etapes

Une installation complète implique 4 actions distinctes.

- Configurer la sortie audio sur **Audiophonics I-Sabre ES9028Q2M**
- Installer le plugin **Audiophonics ON/OFF**
- Installer le plugin **Touch Display**
- Installer un **virtual keyboard**

---

### Configurer la sortie Audio

[v3.webm](https://user-images.githubusercontent.com/17196909/221600807-02cff53e-8563-437f-bbd8-a374be4bf305.webm)

- Ouvrez l'interface web Volumio
- Rendez-vous dans la section Options de lecture
- Placez le selecteur I2S DAC en position ON
- Dans le menu déroulant DAC Model sélectionnez l'option Audiophonics I-Sabre ES9028Q2M
- Sauvegardez et cliquez sur le bouton Redémarrer
- Attendez quelques minutes que l'appareil redémarre
 
---

### Installation des plugins

 ![](https://www.audiophonics.fr/img/cms/Images/Blog/rasptouch_volumio_2023/account.jpg)

Attention, depuis Volumio 3 l'installation d'un plugin requiert de s'authentifier avec un compte myVolumio. Un compte gratuit suffit.

Avant de continuer, utilisez le lien montré ci-dessus dans votre interface web et suivez les instructions pour créer votre compte ou vous y connecter.

---

### Installation du plugin Touch Display

[install_plug_touch.webm](https://user-images.githubusercontent.com/17196909/221601003-36e21e7e-5f86-4767-984d-b7302654005e.webm)

   **Cette vidéo est coupée. L'instalation prend généralement une quinzaine de minutes.**

- Ouvrez l'interface web Volumio
- Rendez-vous dans la section **Plugins**
- Ouvrez l'onglet **System Hardware**
- Installez le plugin **Touch Display**
- Attendez environ une quinzaine de minutes sans toucher au RaspTouch
- Une fois l'installation achevée, activez le plugin. L'écran du Rasptouch devrait s'allumer après quelques secondes puis afficher l'interface web Volumio.
 
---

### Installation du plugin Audiophonics ON/OFF

[install_plug_onoff.webm](https://user-images.githubusercontent.com/17196909/221601317-113f8d25-94a0-4f31-adeb-a2accccdcf47.webm)

- Ouvrez l'interface web Volumio
- Rendez-vous dans la section **Plugins**
- Ouvrez l'onglet **System Hardware**
- Installez le plugin **Audiophonics ON/OFF**
- Attendez environ une vingtaine de seocndes sans toucher au RaspTouch
- Une fois l'installation achevée, activez le plugin.
- Vérifiez à la prochaine mise sous-tension que le bouton physique d'allumage cesse de clignotter après le démarrage système.
 
---

### Vérification de l'installation des plugins

 ![](https://www.audiophonics.fr/img/cms/Images/Blog/rasptouch_volumio_2023/plugins.jpg)
 A ce stade, voici à quoi devrait ressembler la liste des plugins installés.

---

### Installation du clavier virtuel

Tout semble fonctionnel à présent, mais tentez d'utiliser la barre de recherche et vous remarquerez sans doute qu'il vous faut brancher un clavier physique pour rechercher vos pistes dans l'interface web Volumio.

Il existait un plugin clavier virtuel sous Volumio 2 qui permettait de faire apparaître un clavier directement sur l'écran tactile. Malheureusement, celui-ci n'est pas compatible avec Volumio 3.

Pas de panique, nous pouvons reproduire ce comportement assez facilement avec quelques commandes en SSH.

Voici ce que nous allons faire expliqué en langage vernaculaire :

- Le plugin **Touch Display** est un simple navigateur web type chromium installé et lancé automatiquement au démarrage de l'appareil tournant sous Volumio.
- Nous allons télécharger une extension chromium clavier virtuel. Nous choisissons ici celui de [xontab](https://github.com/xontab/chrome-virtual-keyboard) qui est gratuit et fonctionnel.
- Puis nous éditerons le script en charge de lancer ce navigateur web afin qu'il charge notre extension automatiquement.
 
Voici comment cela se traduit en lignes de commandes

 ```
cd /home/volumio/
wget https://github.com/xontab/chrome-virtual-keyboard/archive/master.tar.gz
tar -xvzf master.tar.gz
rm -f master.tar.gz
sudo sed -i 's/http:\/\/localhost:3000.*\?$/http:\/\/localhost:3000 --load-extension=\/home\/volumio\/chrome-virtual-keyboard-master/'  /opt/volumiokiosk.sh
systemctl restart volumio-kiosk
```

La cinquième commande utilise **sudo** afin de demander au système les permissions d'éditer le fichier */opt/volumiokiosk.sh*. Cette commande nécessite d'entrer le mot de passe Volumio (par défaut : ```volumio```).

La dernière commande relance le processus chromium. En règle générale, le clavier virtuel est déjà fonctionnel à ce stade, mais un redémarrage peut-être nécessaire selon les versions.

Pour vérifier l'installation du clavier virtuel, utilisez l'écran tactile du RaspTouch et effectuez une recherche de la façon suivante :

![](https://www.audiophonics.fr/img/cms/Images/Blog/rasptouch_volumio_2023/keyboard_0.jpg)

Cliquez sur le bouton de navigation.

![](https://www.audiophonics.fr/img/cms/Images/Blog/rasptouch_volumio_2023/keyboard_1.jpg)

Cliquez dans le champ texte.

![](https://www.audiophonics.fr/img/cms/Images/Blog/rasptouch_volumio_2023/keyboard_2.jpg)

Vérifiez que le clavier virtuel apparaît à l'écran.
 

--- 

--- 

### Solution de DERNIER RECOURS si vous ne parvenez pas à utiliser la procédure ci-dessus
En **dernier recours** vous pouvez essayer cette [procédure d'installation expérimentale](https://github.com/audiophonics/rasptouch_volumio3/tree/the_hacky_way)



# Roadmap ft_transcendence

## Table des Matières
1. [Configuration du Projet](#1-configuration-du-projet)
2. [Mise en Place du Framework Backend](#2-mise-en-place-du-framework-backend)
3. [Développement du Framework Frontend et de l'UI](#3-développement-du-framework-frontend-et-de-lui)
4. [Intégration de la Base de Données](#4-intégration-de-la-base-de-données)
5. [Gestion des Utilisateurs et Authentification](#5-gestion-des-utilisateurs-et-authentification)
6. [Fonctionnalité de Chat en Direct](#6-fonctionnalité-de-chat-en-direct)
7. [Mise en Œuvre des Graphiques 3D](#7-mise-en-œuvre-des-graphiques-3d)
8. [Intégration backend 3D](#8-intégration-backend-3d)
9. [Tableaux de Bord des Statistiques Utilisateur et Jeu](#9-tableaux-de-bord-des-statistiques-utilisateur-et-jeu)
10. [Conformité au RGPD et Gestion des Données](#10-conformité-au-rgpd-et-gestion-des-données)

---

### 1. Configuration du Projet
#### Sous-tâches:
  - Configuration de l'environnement (IDE, Docker, Git).
  - Initialisation du dépôt Git et configuration Docker.
  - Création de la structure de projet pour backend et frontend.
#### Technologies:
  - Docker, Git, IDEs.

### 2. Mise en Place du Framework Backend (LOUIS)
#### Sous-tâches:
  - Configuration de Django comme framework backend.
  - Configuration basique du serveur avec Django.
  - Mise en place des points de terminaison API RESTful. (swagger)
#### Technologies:
  - Django, Python.

### 3. Développement du Framework Frontend et de l'UI (VINCENT)
#### Sous-tâches:
  - Intégration de Bootstrap pour la conception réactive.
  - Création des composants UI (entêtes, pieds de page, barres de navigation).
  - Création de maquettes et wireframe pour les pages du site
#### Technologies:
  - JavaScript, HTML5, CSS3, Bootstrap.

### 4. Intégration de la Base de Données
#### Sous-tâches:
  - Conception du schéma de base de données (utilisateurs, jeux, chats).
#### Technologies:
  - PostgreSQL, ORM Django.

### 5. Gestion des Utilisateurs et Authentification (LOUIS)
#### Sous-tâches:
  - Mise en place des fonctionnalités d'inscription et de connexion des utilisateurs.
  - Configuration de l'authentification OAuth 2.0 avec 42. (JUSTIN) 
  - Gestion de profil utilisateur.
#### Technologies:
  - Django, OAuth 2.0, Python.

### 6. Fonctionnalité de Chat en Direct (MAX)
#### Sous-tâches:
  - Développement des modèles de chat et intégration avec la base de données.
  - Mise en œuvre de WebSocket pour la communication en temps réel.
  - UI pour le système de chat. (VINCENT)
#### Technologies:
  - Django Channels, WebSockets, JavaScript.

### 7. Mise en Œuvre des Graphiques 3D (JUSTIN)
#### Sous-tâches:
  - Apprentissage et configuration de ThreeJS/WebGL.
  - Rendu 3D de base pour le jeu Pong.
  - Test et optimisation.
#### Technologies:
  - ThreeJS, WebGL.

### 8. Intégration PONG backend + Tournoi (JUSTIN)
#### Sous-tâches:
  - Mise en place des endpoints pour gérer le jeu
  - Mise en place des endpoints pour récupérer les données.
  - Mise en place du système de tournoi)
#### Technologies:
  - Django, Django REST framework, WebSockets?

### 9. Tableaux de Bord des Statistiques Utilisateur et Jeu (VINCENT FRONT - LOUIS BACK)
#### Sous-tâches:
  - Développement de la logique backend pour les statistiques.
  - Mise en place des tableaux de bord dans le frontend.
  - Visualisation des statistiques à l'aide de graphiques.
#### Technologies:
  - JavaScript, D3.js ou bibliothèques similaires pour la visualisation des données.

### 10. Conformité multiple languages.
#### Sous-tâches:
  - ?
#### Technologies:
  - Speak english

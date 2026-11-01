# BankFlow — prototype de test

## Lancer

Ouvrez `index.html` dans un navigateur moderne. Aucun serveur, framework ou PHP n’est néctestre. Créez un compte de test avec une adresse et un mot de passe de votre choix (4 caractères minimum), puis reconnectez-vous avec ces identifiants sur le même navigateur.

## Fonctions

- Compte de test conservé localement dans le navigateur.
- Vue « Mon compte », solde initial de test et montants masqués au chargement.
- Virements de test, solde local, historique et page de suivi des validations.
- RIB de test invalide (`FR00…`) avec bouton de copie.

## Important

BankFlow est une interface de test sans service bancaire. Les virements ne sont pas envoyés, le RIB est volontairement invalide et le statut d’approbation est indicatif. Les données `localStorage` sont propres au navigateur et ne constituent pas un registre fiable. N’utilisez aucune vraie donnée bancaire.

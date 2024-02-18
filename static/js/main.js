// main.js

document.addEventListener('DOMContentLoaded', function() {
    loadDefaultContent(); // Charge le contenu par défaut au chargement initial de la page

    // Ajoute les gestionnaires d'événements pour les boutons
    document.getElementById('content').addEventListener('click', handleButtonClick);
});

function handleButtonClick(event)
{
    var target = event.target;

    if (target.tagName === 'BUTTON' && target.dataset.content)
	{
        event.preventDefault();
        loadContent(target.dataset.content, target.dataset.script);
    }
}

function loadDefaultContent()
{
    var defaultContentUrl = loginUrl; // Utilisation de la variable JavaScript définie dans le template
    var defaultScriptUrl = loginScriptUrl; // Utilisation de la variable JavaScript définie dans le template

    fetch(defaultContentUrl)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            loadScript(defaultScriptUrl);
        })
        .catch(error => {
            console.error('Error loading the default content:', error);
        });
}

function loadContent(contentUrl, scriptUrl)
{
    fetch(contentUrl)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            loadScript(scriptUrl);
        })

        .catch(error => {console.error('Error loading the content:', error);});
}

function loadScript(scriptUrl)
{
    var existingScript = document.querySelector(`script[src="${scriptUrl}"]`);

    if (existingScript)
        existingScript.remove();

    var script = document.createElement('script');

    script.src = scriptUrl;
    document.body.appendChild(script);
}

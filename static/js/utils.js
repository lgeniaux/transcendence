function loadContent(url, targetSelector, contentName)
{
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.querySelector(targetSelector).innerHTML = html;
        })
        .catch(error => console.error(`Erreur lors du chargement de ${contentName} :`, error));
}

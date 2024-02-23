document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', loadContentAndScript);
    document.getElementById('registerBtn').addEventListener('click', loadContentAndScript);
});

function loadContentAndScript(event) {
    var button = event.target;
    var contentUrl = button.getAttribute('data-content');
    var scriptUrl = button.getAttribute('data-script');

    fetch(contentUrl)
        .then(response => response.text())
        .then(html => {
            document.getElementById('content').innerHTML = html;
            loadScript(scriptUrl);
        })
        .catch(error => {
            console.error('Error loading the content:', error);
        });
}

function loadScript(scriptUrl) {
    var existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
        existingScript.remove();
    }
    var script = document.createElement('script');
    script.src = scriptUrl;
    document.body.appendChild(script);
}

window.initializeForm = function(formId, initFunction) {
    if (document.getElementById(formId)) {
        initFunction();
    } else {
        document.addEventListener('DOMContentLoaded', initFunction);
    }
};
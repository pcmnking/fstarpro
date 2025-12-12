document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        select.addEventListener('change', function() {
            fetch('', {
                method: 'POST',
                body: new FormData(form)
            })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                document.querySelector('.chart-container').innerHTML = 
                    doc.querySelector('.chart-container').innerHTML;
                    
                document.getElementById('four-trans').innerHTML = 
                    doc.getElementById('four-trans').innerHTML;
            })
            .catch(error => console.error('Error:', error));
        });
    });
});
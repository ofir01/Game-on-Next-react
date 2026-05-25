
export function showLoader(container, seconds = 2) {
    return new Promise((resolve) => {
        const loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.classList.add('spinner', 'show');
        container.appendChild(loader);

        setTimeout(() => {
            loader.classList.remove('show');
            loader.remove();
            resolve();
        }, seconds * 1000);
    });
}

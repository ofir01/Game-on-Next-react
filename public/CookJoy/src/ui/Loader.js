
export function showLoader(container, seconds = 2) {
    return new Promise((resolve) => {
        const loader = document.createElement('div');
        loader.id = 'pageLoader';
        loader.classList.add('show');
        loader.innerHTML = `
      <div class="cooking-loader">
        <div class="lid"></div>
        <div class="pot"></div>
        <div class="steam"></div>
        <div class="fire"></div>
      </div>
    `;

        container.appendChild(loader);

        setTimeout(() => {
            loader.classList.remove('show');
            loader.remove();
            resolve();
        }, seconds * 1000);
    });
}




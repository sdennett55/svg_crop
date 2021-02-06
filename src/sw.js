export const serviceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }

  /* TODO: add a button that prompts the PWA install banner-
    makes it easier to install

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const btn = document.getElementById('install');
    btn.onclick = () => deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choice) => {
      console.log(choice);
    });
  }); */
};

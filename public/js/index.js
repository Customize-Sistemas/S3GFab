const buttom = document.getElementById('submit');

buttom.addEventListener('click', async () => {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  document.getElementById('message').innerHTML = '';

  fetch('/api/sessions', {
    method: 'POST',
    cache: 'default',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user,
      pass,
    }),
  }).then(async response => {
    const data = await response.json();

    if (response.status === 400) {
      return document.getElementById('message').insertAdjacentHTML(
        'beforeend',
        `<div class="w-80 italic bg-red-800 rounded p-2 text-center">
            <span class="text-white text-center">${data.message}</span>
          </div>`,
      );
    }

    if (response.status === 500) {
      return document.getElementById('message').insertAdjacentHTML(
        'beforeend',
        `<div class="w-80 italic bg-red-800 rounded p-2 text-center">
            <span class="text-white text-center">${data.message}</span>
          </div>`,
      );
    }

    document.getElementById('message').insertAdjacentHTML(
      'beforeend',
      `<div class="w-80 italic bg-green-800 rounded p-2 text-center">
          <span class="text-white text-center">Login efetuado com sucesso!</span>
          <span class="text-white text-center">Redirecionando...</span>
        </div>`,
    );

    return setTimeout(() => {
      window.location.href = '/home';
    }, 3000);
  });
});

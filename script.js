const quoteForm = document.getElementById('quoteForm');

if (quoteForm) {
  quoteForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = new FormData(quoteForm);
    const name = data.get('name')?.toString().trim() || '';
    const phone = data.get('phone')?.toString().trim() || '';
    const postal = data.get('postal')?.toString().trim() || '';
    const details = data.get('details')?.toString().trim() || '';

    const message = [
      'Hi AMJ Blinds, I would like a free quote.',
      '',
      `Name: ${name}`,
      `Phone: ${phone}`,
      postal ? `Postal code: ${postal}` : null,
      details ? `Project details: ${details}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const url = `https://wa.me/16047214719?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

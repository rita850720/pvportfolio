document.querySelectorAll('[data-icsr-tabs]').forEach((tabGroup) => {
  const buttons = [...tabGroup.querySelectorAll('[role="tab"]')];
  const panels = buttons.map((button) => document.getElementById(button.getAttribute('aria-controls')));

  const selectTab = (selected, updateHash = true) => {
    buttons.forEach((button, index) => {
      const active = button === selected;
      button.setAttribute('aria-selected', String(active));
      panels[index].hidden = !active;
    });
    if (updateHash) history.replaceState(null, '', `#${selected.getAttribute('aria-controls')}`);
  };

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => selectTab(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + buttons.length) % buttons.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % buttons.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = buttons.length - 1;
      buttons[nextIndex].focus();
      selectTab(buttons[nextIndex]);
    });
  });

  const hashButton = buttons.find((button) => `#${button.getAttribute('aria-controls')}` === window.location.hash);
  selectTab(hashButton || buttons[0], false);
});

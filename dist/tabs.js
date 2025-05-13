// tabs.js
document.querySelectorAll('.tab-nav li').forEach(tab => {
    tab.addEventListener('click', () => {
      // 1) Switch active class
      document
        .querySelectorAll('.tab-nav li')
        .forEach(li => li.classList.remove('active'));
      tab.classList.add('active');
  
      // 2) Load the selected chart
      const src = tab.getAttribute('data-src');
      document.getElementById('chart-frame').src = src;
    });
  });
  
document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const sidebarToggle = document.getElementById('sidebarToggle');

  sidebarToggle.addEventListener('click', function () {
    sidebar.style.transition = 'transform 0.15s ease';
    mainContent.style.transition = 'margin-left 0.15s ease';
    
    if (window.innerWidth > 992) {
      sidebar.classList.toggle('sidebar-collapsed');
      mainContent.classList.toggle('content-expanded');
    } else {
      sidebar.classList.toggle('show');
    }
  });

  if (window.innerWidth <= 992) {
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.style.transition = 'transform 0.15s ease';
        sidebar.classList.remove('show');
      });
    });
  }
  
});

function resizeIframe(iframe) {
  iframe.style.transition = 'height 0.15s ease';
  iframe.style.height = iframe.contentWindow.document.documentElement.scrollHeight + 'px';
}
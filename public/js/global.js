const btnBars = document.querySelector('.btn-bars');
const menuResponsive = document.querySelector('.menu-responsive');
const bntClose = document.querySelector('.btn-close');

btnBars.addEventListener('click', () => {
	menuResponsive.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
});

bntClose.addEventListener('click', () => {
	menuResponsive.classList.remove('active');
    document.body.classList.remove('no-scroll');
});
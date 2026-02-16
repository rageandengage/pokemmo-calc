/*
* Dark mode toggle
*
* In its current state, it will cause a minor FOIT.
* Basically, the background behind the panels will
* briefly flash white before turning dark. It's
* better than before, but not perfect.
*/

/*
* localStorage will only store strings
* This means that if it has the value 'false',
* It will be truey and incorrectly cause the
* dark theme to load.
*/
var prefersDarkTheme = localStorage.getItem('darkTheme') ? localStorage.getItem('darkTheme') === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
var darkThemeButton = document.getElementById('dark-theme-toggle');
function getDarkThemeLabel() {
	return typeof I18N !== 'undefined' ? I18N.t('ui', 'Click for Dark Theme') : 'Click for Dark Theme';
}
function getLightThemeLabel() {
	return typeof I18N !== 'undefined' ? I18N.t('ui', 'Click for Light Theme') : 'Click for Light Theme';
}
darkThemeButton.innerText = prefersDarkTheme ? getLightThemeLabel() : getDarkThemeLabel();
if (prefersDarkTheme) {
	var darkStyles = document.getElementById('dark-theme-styles');
	if (darkStyles.disabled) {
		darkStyles.disabled = !darkStyles.disabled;
	}
}

/*
* Function that toggles light and dark mode
* Doesn't use jQuery, probably could with some modification
*/
function toggleTheme() {
	prefersDarkTheme = !prefersDarkTheme;

	var darkStyles = document.getElementById('dark-theme-styles');
	darkStyles.disabled = !darkStyles.disabled;

	localStorage.setItem('darkTheme', prefersDarkTheme);
	darkThemeButton.innerText = prefersDarkTheme ? getLightThemeLabel() : getDarkThemeLabel();
}

darkThemeButton.addEventListener('click', toggleTheme);

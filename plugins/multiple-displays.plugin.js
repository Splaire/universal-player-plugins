const LOCALSTORAGE_KEY = 'plugin:selectedScreen';

function setScreen(displayIdx, displays) {
    const chosenDisplay = displays[displayIdx];
    localStorage.setItem(LOCALSTORAGE_KEY, chosenDisplay.id);
    return chosenDisplay;
}

module.exports = function MultipleDisplaysPlugin(api) {
    const setBounds = display =>
        api.electron.remote.getCurrentWindow().setBounds(display.bounds);

    const displays = api.electron.remote.screen.getAllDisplays();

    if (displays.length <= 1) {
        return;
    }

    api.electron.remote.globalShortcut.register('CmdOrCtrl+Shift+L', () => {
        localStorage.removeItem(LOCALSTORAGE_KEY);
        api.electron.remote.app.quit();
    });

    const selectedScreen = localStorage.getItem(LOCALSTORAGE_KEY) || '';
    const display = displays.find(
        d => d.id.toString() === selectedScreen.toString()
    );

    if (display) {
        return setBounds(display);
    }

    localStorage.removeItem(LOCALSTORAGE_KEY);
    api.electron.remote.dialog.showMessageBox(
        {
            type: 'question',
            buttons: displays.map(d => `${d.size.width}x${d.size.height}`),
            defaultId: 0,
            title: 'Please select a display',
            message: 'Please select a display',
            detail: `${displays.length} displays found, but none selected. Select one based on it's dimensions.`,
            noLink: true,
        },
        response => {
            const chosenDisplay = setScreen(response, displays);
            setBounds(chosenDisplay);
        }
    );
};

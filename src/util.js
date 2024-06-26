export const add = (a, b) => a + b;

export const map = (arr, key) => {
    return arr.map(v => v[key]);
};

export const isDark = () => {
    const { matchMedia } = window;
    return matchMedia('(prefers-color-scheme: dark)').matches;
};

export const addListenerPrefersColorScheme = callback => {
    const { matchMedia } = window;
    matchMedia('(prefers-color-scheme: dark)').addListener(mediaQueryList => {
        callback(mediaQueryList.matches);
    });
    matchMedia('(prefers-color-scheme: light)').addListener(mediaQueryList => {
        callback(!mediaQueryList.matches);
    });
};

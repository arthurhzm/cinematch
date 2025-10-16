export type LocalStorageKey = 'searchResults' | 'rememberMe'

export const useLocalStorage = () => {

    const getLocalStorageItem = (key: LocalStorageKey) => {
        return localStorage.getItem(key);
    }

    const setLocalStorageItem = (key: LocalStorageKey, value: any) => {
        localStorage.setItem(key, JSON.stringify(value));
    }

    const clearLocalStorageItem = (key: LocalStorageKey) => {
        localStorage.removeItem(key);
    }


    return {
        getLocalStorageItem,
        setLocalStorageItem,
        clearLocalStorageItem
    }
}
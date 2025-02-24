/*******************
* Cookies handler *
*******************/
window.Cookies = window.Cookies || {
    // https://stackoverflow.com/a/25490531/1028230
    get: function (cookieName) {
        var b = document.cookie.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
        return b ? b.pop() : '';
    },
    set: function (name, value) {
        document.cookie =
            '{0}={1};expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/;SameSite=Lax'
            .replace('{0}', name)
            .replace('{1}', value);
    },
    delete: function (name) {
        document.cookie = '{0}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            .replace('{0}', name);
    }
};
document.addEventListener('DOMContentLoaded', function () {
    var form = document.forms[0];
    form['ubiq-username'].value = localStorage.getItem('ubiq:username');
    form['ubiq-device-name'].value = localStorage.getItem('ubiq:device-name');

    form.addEventListener('submit', function () {
        var username = form['ubiq-username'].value,
            device_name = form['ubiq-device-name'].value;

        localStorage.setItem('ubiq:username', username);
        localStorage.setItem('ubiq:device-name', device_name);
    });
});
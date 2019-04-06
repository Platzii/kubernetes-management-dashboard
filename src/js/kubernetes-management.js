$(document).ready(function() {

    $.notifyDefaults({
        // newest_on_top: true,
        offset: {
            x: 20,
            y: 80
        },
        spacing: -12,
        template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert"><button type="button" aria-hidden="true" class="close" data-notify="dismiss">&times;</button><span data-notify="icon"></span> <span data-notify="title">{1}</span> <span data-notify="message">{2}</span><div class="progress" data-notify="progressbar"><div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div></div><a href="{3}" target="{4}" data-notify="url"></a></div>'
    });

    function showInfoNotification(message, title = 'Info:', icon = 'fa fa-info-circle', url = undefined, delay = undefined) {
        $.notify({
            icon: icon,
            title: '<strong>'+title+'</strong>',
            message: message,
            url: url
        },{
            type: 'info',
            animate: {
                enter: '',
                exit: 'animated fadeOut'
            },
            delay: delay
        });
    }

    function showSuccessNotification(message, title = 'Success:', icon = 'fa fa-check-circle', url = undefined, delay = undefined) {
        $.notify({
            icon: icon,
            title: '<strong>'+title+'</strong>',
            message: message,
            url: url
        },{
            type: 'success',
            animate: {
                enter: '',
                exit: 'animated fadeOut'
            },
            delay: delay
        });
    }

    function showWarningNotification(message, title = 'Warning:', icon = 'fa fa-exclamation-circle', url = undefined, delay = undefined) {
        $.notify({
            icon: icon,
            title: '<strong>'+title+'</strong>',
            message: message,
            url: url
        },{
            type: 'warning',
            animate: {
                enter: '',
                exit: 'animated fadeOut'
            },
            delay: delay
        });
    }

    function showErrorNotification(message, title = 'Error:', icon = 'fa fa-exclamation-circle', url = undefined, delay = undefined) {
        $.notify({
            icon: icon,
            title: '<strong>'+title+'</strong>',
            message: message,
            url: url
        },{
            type: 'danger',
            animate: {
                enter: 'animated bounceIn',
                exit: 'animated fadeOut'
            },
            delay: delay
        });
    }

    /////

    function getProxyList(callback) {
        $.ajax({
            url: 'http://127.0.0.1:8000/proxy/list',
            dataType: 'json',
            success: function(data) {
                callback(true, data);
            },
            error: function(data) {
                callback(false, data)
            }
        });
    }

    function startProxy(name, callback) {
        $.ajax({
            url: 'http://127.0.0.1:8000/proxy/start?name='+name,
            dataType: 'json',
            success: function(data) {
                callback(true, data);
            },
            error: function(data) {
                callback(false, data)
            }
        });
    }

    function stopProxy(name, callback) {
        $.ajax({
            url: 'http://127.0.0.1:8000/proxy/stop?name='+name,
            dataType: 'json',
            success: function(data) {
                callback(true, data);
            },
            error: function(data) {
                callback(false, data)
            }
        });
    }

    function fillTable() {
        getProxyList(function(success, data) {
            if (!success) {
                showErrorNotification('<p>Could not get proxy list from API</p>')
                return
            }
            var proxies = data.result;
            $.each(proxies, function(i, proxy) {
                if (proxy.active == true) {
                    $('<tr>').append(
                        $('<td>').text(i+1),
                        $('<td>').text(proxy.name),
                        $('<td>').text(proxy.k8sVersion),
                        $('<td>').text(proxy.port),
                        $('<td>').text(proxy.pid),
                        $('<td>').append(
                            $('<button>').attr('data-proxy-port', proxy.port).addClass('btn btn-link proxy-link').text('http://localhost:'+proxy.port+'/')
                        ),
                        $('<td>').addClass('text-right').append(
                            $('<button>').attr('data-proxy-name', proxy.name).addClass('btn btn-danger proxy-stop').text('Stop'),
                            $('<button>').attr('data-proxy-port', proxy.port).attr('data-k8s-version-major', proxy.k8sMajorVersion).attr('data-k8s-version-minor', proxy.k8sMinorVersion).addClass('btn btn-primary proxy-dashboard').text('Open dashboard')
                        )
                    ).appendTo($('#proxy-table tbody'));
                } else {
                    $('<tr>').append(
                        $('<td>').text(i+1),
                        $('<td>').text(proxy.name),
                        $('<td>').text(proxy.k8sVersion),
                        $('<td>').text(proxy.port),
                        $('<td>'),
                        $('<td>'),
                        $('<td>').addClass('text-right').append(
                            $('<button>').attr('data-proxy-name', proxy.name).addClass('btn btn-success proxy-start').text('Start'),
                            $('<button>').attr('data-proxy-port', proxy.port).attr('data-k8s-version-major', proxy.k8sMajorVersion).attr('data-k8s-version-minor', proxy.k8sMinorVersion).addClass('btn btn-primary proxy-dashboard disabled').text('Open dashboard')
                        )
                    ).appendTo($('#proxy-table tbody'));
                }
            });
        });
    }

    function refreshTable() {
        $('#proxy-table tbody').empty();
        fillTable();
    }

    /////

    $('#proxy-table').on('click', '.proxy-start', function() {
        var name = $(this).attr('data-proxy-name');
        startProxy(name, function(success, data) {
            if (!success) {
                if (typeof data.responseJSON != "undefined") {
                    showErrorNotification('<p>Could not start proxy <em>'+name+'</em></p><p><strong>API response:</strong><br />'+data.responseJSON.message+'</p>')
                } else {
                    showErrorNotification('<p>Could not start proxy <em>'+name+'</em></p><p>API unavailable or responded with an unknown error</p>')
                }
                return
            }
            showSuccessNotification('<p>Proxy connection to <em>'+data.result.name+'</em> started</p>', 'Started!', undefined, 'http://localhost:'+data.result.port+'/ui/')
            refreshTable();
        });
    });

    $('#proxy-table').on('click', '.proxy-stop', function() {
        var name = $(this).attr('data-proxy-name');
        stopProxy(name, function(success, data) {
            if (!success) {
                if (typeof data.responseJSON != "undefined") {
                    showErrorNotification('<p>Could not stop proxy <em>'+name+'</em></p><p><strong>API response:</strong><br />'+data.responseJSON.message+'</p>')
                } else {
                    showErrorNotification('<p>Could not stop proxy <em>'+name+'</em></p><p>API unavailable or responded with an unknown error</p>')
                }
                return
            }
            showSuccessNotification('<p>Proxy connection to <em>'+data.result.name+'</em> stopped</p>', 'Stopped!', 'fa fa-times-circle')
            refreshTable();
        });
    });

    $('#proxy-table').on('click', '.proxy-dashboard', function() {
        if ($(this).hasClass('disabled')) { return }
        var port = $(this).attr('data-proxy-port');
        var k8sMajorVersion = $(this).attr('data-k8s-version-major');
        var k8sMinorVersion = $(this).attr('data-k8s-version-minor');
        if (k8sMajorVersion <= 1 && k8sMinorVersion <= 9) {
            window.open('http://localhost:'+port+'/ui/');
        } else {
            window.open('http://localhost:'+port+'/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/');
        }
    });

    $('#proxy-table').on('click', '.proxy-link', function() {
        var port = $(this).attr('data-proxy-port');
        window.open('http://localhost:'+port+'/');
    });

    /////

    fillTable();
    // showInfoNotification('<p>Connecting to Kubernetes Proxy Management API</p>', 'Hello!', 'fa fa-circle-o-notch fa-spin', undefined, 500)
});
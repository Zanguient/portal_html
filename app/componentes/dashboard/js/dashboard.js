/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("dashboard", ['SignalR']) 

.controller("dashboardCtrl", ['$scope',
                              '$state',
                              '$timeout',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$timeout,$webapi,$apis){ 
    
    $scope.extrato = undefined;   
    // Flags
    $scope.exibeTela = false;                           
                                
    // Inicialização do controller
    $scope.dashboardInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Dashboard';                          
        $scope.pagina.subtitulo = 'Resumo do dia';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            // ....
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    }
    
    
}])


.factory('realtimeservice',['$rootScope','$scope','Hub', '$timeout', function($rootScope, $scope, Hub, $timeout){
    
    //declaring the hub connection
    var hub = new Hub('message', {

        //client side methods
        listeners:{
            'updateMessages': function (data) {
                console.log("RECEBEU");
                console.log(data);
                $rootScope.$apply();
            }
        },

        //server side methods
        methods: ['send'],

        //query params sent on initial connection
        queryParams:{
            token: $scope.token
        },

        //handle connection error
        errorHandler: function(error){
            console.log("ERRO");
            console.error(error);
        },
        
        transport: 'webSockets',

        //specify a non default root
        //rootPath: '/api

        stateChanged: function(state){
            switch (state.newState) {
                case $.signalR.connectionState.connecting:
                    console.log("CONECTANDO...");
                    break;
                case $.signalR.connectionState.connected:
                    console.log("CONECTADO!");
                    break;
                case $.signalR.connectionState.reconnecting:
                    console.log("RECONECTANDO...");
                    break;
                case $.signalR.connectionState.disconnected:
                    console.log("DESCONECTADO!");
                    break;
            }
        }
    });

    var send = function (employee) {
        hub.send("deivid", "teste"); //Calling a server method
    };

    return {
        send: send
    };
}]);
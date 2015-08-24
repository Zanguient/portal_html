/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-monitor-cargas", ['SignalR']) 

.factory('monitorService',
    ["$http", "$rootScope", "$location", "Hub", "$timeout",
    function ($http, $rootScope, $location, Hub, $timeout) {
        
        var monitor = this;

        //Hub setup
        var hub = new Hub("ServerAtosCapital", {
            listeners: {
                'notifyCarga': function (mudancas) {
                    console.log("NOTIFY CARGA");console.log(mudancas);
                    $scope.$broadcast("notifyMonitor", mudancas);
                }
            },
            rootPath : 'http://localhost:55007/signalr',
            
            methods: ['conectado'],
            errorHandler: function (error) {
                //console.log("ERRO");
                //console.log(error);
            },
            hubDisconnected: function () {
                if (hub.connection.lastError) {
                    hub.connection.start();
                }
            },
            transport: 'webSockets',
            logging: false,
            
            /*stateChanged: function(state){
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
            }*/
        });

        /**
          * Função que notifica ao servidor que está monitorando
          */
        monitor.conectado = function () {
            hub.conectado($scope.token); //Calling a server method
        };
        /**
          *
          */
        monitor.desconectar = function(){
            hub.connection.stop();    
        };
        /*monitor.send = function (userName, chatMessage) {
            hub.send(userName, chatMessage);
        }*/
        
        return monitor;
    }])

.controller("administrativo-monitor-cargasCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            'monitorService',      
                                            function($scope,$state,$http,/*$campos,*/
                                                     $webapi,$apis,$filter,monitorService){ 
   
    $scope.monitor = monitorService;                                         
    $scope.monitorCargas = [];                                            
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyMonitorPos = 1; // posição da div que vai receber o loading progress
    $scope.itens_pagina = [50, 100, 150, 200];
    $scope.filtro = { data : new Date(),
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 103,//$campos.administracao.logacesso.dtAcesso, 
                                         order : 1}};                                               
    // flags
    $scope.abrirCalendarioData = false;                                             
    $scope.exibeTela = false;                                            
 
                                                
    // Inicialização do controller
    $scope.administrativo_monitorCargasInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Monitor';                          
        $scope.pagina.subtitulo = 'Monitor de Cargas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $scope.monitor.desconectar();
            $state.go(state, params);
        });
        $scope.$on('notifyMonitor', function(event, mudancas){
            console.log("RECEBEU MUDANÇAS");
            console.log(mudancas);
            //$rootScope.$apply();
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Busca
            // ...
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    } 
    
    
    
    
    
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
    }
    
    // DATA
    $scope.exibeCalendario = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendario = !$scope.abrirCalendario;
      };
    $scope.alterouData = function(){
        console.log($scope.filtro.data);
    };

}]);
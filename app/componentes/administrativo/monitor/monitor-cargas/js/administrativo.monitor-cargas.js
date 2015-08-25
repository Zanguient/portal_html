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

        //jQuery.support.cors = true;
        
        //Hub setup
        var hub = new Hub("ServerAtosCapital", {
            
            rootPath : 'http://localhost:50780/signalr',
            
            listeners: {
                'notifyCarga': function (mudancas) {
                    //console.log("NOTIFY CARGA");console.log(mudancas);
                    $rootScope.$broadcast("notifyMonitor", mudancas);
                }
            },

            methods: ['conectado'],
            
            queryParams:{
                'token': $rootScope.token
            },
            
            errorHandler: function (error) {
                console.log("ERRO");
                console.log(error);
            },
            /*hubDisconnected: function () {
                if (hub.connection.lastError) {
                    hub.connection.start();
                }
            },*/
            jsonp : true,
            transport: 'webSockets', //'longPolling'
            logging: false,
            
            stateChanged: function(state){
                switch (state.newState) {
                    case $.signalR.connectionState.connecting:
                        //console.log($rootScope.token);
                        console.log("CONECTANDO...");
                        break;
                    case $.signalR.connectionState.connected:
                        console.log("CONECTADO!");
                        monitor.conectado();
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
        
        monitor.data = "";
        
        var getAnoMesCorrente = function(){
            var dt = new Date();
            var mes = dt.getMonth() + 1;
            var ano = dt.getFullYear();
            if(mes < 10) return ano + "0" + mes;
            return ano + "" + mes;    
        }

        /**
          * Função que notifica ao servidor que está monitorando
          */
        monitor.conectado = function () {
            if(!monitor.data || monitor.data.length < 6) monitor.data = getAnoMesCorrente();
            hub.conectado(monitor.data); //Calling a server method
        };
        /**
          *
          */
        monitor.desconectar = function(){
            hub.connection.stop();    
        };
        
        return monitor;
    }])

.controller("administrativo-monitor-cargasCtrl", ['$scope',
                                            '$rootScope',
                                            '$state',
                                            '$http',
                                            /*'$campos',*/
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            'monitorService',      
                                            function($scope,$rootScope,$state,$http,/*$campos,*/
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
        $rootScope.$on('notifyMonitor', function(event, mudancas){
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
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
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